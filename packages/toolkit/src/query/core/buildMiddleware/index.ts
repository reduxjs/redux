import type { AnyAction, Middleware, ThunkDispatch } from '@reduxjs/toolkit'
import { createAction } from '@reduxjs/toolkit'

import type {
  EndpointDefinitions,
  FullTagDescription,
} from '../../endpointDefinitions'
import type { QueryStatus, QuerySubState, RootState } from '../apiState'
import type { QueryThunkArg } from '../buildThunks'
import { buildCacheCollectionHandler } from './cacheCollection'
import { buildInvalidationByTagsHandler } from './invalidationByTags'
import { buildPollingHandler } from './polling'
import type {
  BuildMiddlewareInput,
  InternalHandlerBuilder,
  InternalMiddlewareState,
} from './types'
import { buildWindowEventHandler } from './windowEventHandling'
import { buildCacheLifecycleHandler } from './cacheLifecycle'
import { buildQueryLifecycleHandler } from './queryLifecycle'
import { buildDevCheckHandler } from './devMiddleware'
import { buildBatchedActionsHandler } from './batchActions'

export function buildMiddleware<
  Definitions extends EndpointDefinitions,
  ReducerPath extends string,
  TagTypes extends string
>(input: BuildMiddlewareInput<Definitions, ReducerPath, TagTypes>) {
  const { reducerPath, queryThunk, api, context } = input
  const { apiUid } = context

  const actions = {
    invalidateTags: createAction<
      Array<TagTypes | FullTagDescription<TagTypes>>
    >(`${reducerPath}/invalidateTags`),
  }

  const isThisApiSliceAction = (action: AnyAction) => {
    return (
      !!action &&
      typeof action.type === 'string' &&
      action.type.startsWith(`${reducerPath}/`)
    )
  }

  const handlerBuilders: InternalHandlerBuilder[] = [
    buildDevCheckHandler,
    buildCacheCollectionHandler,
    buildInvalidationByTagsHandler,
    buildPollingHandler,
    buildCacheLifecycleHandler,
    buildQueryLifecycleHandler,
  ]

  const middleware: Middleware<
    {},
    RootState<Definitions, string, ReducerPath>,
    ThunkDispatch<any, any, AnyAction>
  > = (mwApi) => {
    let initialized = false

    let internalState: InternalMiddlewareState = {
      currentSubscriptions: {},
    }

    const builderArgs = {
      ...(input as any as BuildMiddlewareInput<
        EndpointDefinitions,
        string,
        string
      >),
      internalState,
      refetchQuery,
    }

    const handlers = handlerBuilders.map((build) => build(builderArgs))

    const batchedActionsHandler = buildBatchedActionsHandler(builderArgs)
    const windowEventsHandler = buildWindowEventHandler(builderArgs)

    return (next) => {
      return (action) => {
        if (!initialized) {
          initialized = true
          // dispatch before any other action
          mwApi.dispatch(api.internalActions.middlewareRegistered(apiUid))
        }

        const mwApiWithNext = { ...mwApi, next }

        const stateBefore = mwApi.getState()

        const [actionShouldContinue, hasSubscription] = batchedActionsHandler(
          action,
          mwApiWithNext,
          stateBefore
        )

        let res: any

        if (actionShouldContinue) {
          res = next(action)
        } else {
          res = hasSubscription
        }

        if (!!mwApi.getState()[reducerPath]) {
          // Only run these checks if the middleware is registered okay

          // This looks for actions that aren't specific to the API slice
          windowEventsHandler(action, mwApiWithNext, stateBefore)

          if (
            isThisApiSliceAction(action) ||
            context.hasRehydrationInfo(action)
          ) {
            // Only run these additional checks if the actions are part of the API slice,
            // or the action has hydration-related data
            for (let handler of handlers) {
              handler(action, mwApiWithNext, stateBefore)
            }
          }
        }

        return res
      }
    }
  }

  return { middleware, actions }

  function refetchQuery(
    querySubState: Exclude<
      QuerySubState<any>,
      { status: QueryStatus.uninitialized }
    >,
    queryCacheKey: string,
    override: Partial<QueryThunkArg> = {}
  ) {
    return queryThunk({
      type: 'query',
      endpointName: querySubState.endpointName,
      originalArgs: querySubState.originalArgs,
      subscribe: false,
      forceRefetch: true,
      queryCacheKey: queryCacheKey as any,
      ...override,
    })
  }
}
