import { compose } from 'redux'

import type { AnyAction, Middleware, ThunkDispatch } from '@reduxjs/toolkit'
import { createAction } from '@reduxjs/toolkit'

import type {
  EndpointDefinitions,
  FullTagDescription,
} from '../../endpointDefinitions'
import type { QueryStatus, QuerySubState, RootState } from '../apiState'
import type { QueryThunkArg } from '../buildThunks'
import { build as buildCacheCollection } from './cacheCollection'
import { build as buildInvalidationByTags } from './invalidationByTags'
import { build as buildPolling } from './polling'
import type { BuildMiddlewareInput } from './types'
import { build as buildWindowEventHandling } from './windowEventHandling'
import { build as buildCacheLifecycle } from './cacheLifecycle'
import { build as buildQueryLifecycle } from './queryLifecycle'
import { build as buildDevMiddleware } from './devMiddleware'

export function buildMiddleware<
  Definitions extends EndpointDefinitions,
  ReducerPath extends string,
  TagTypes extends string
>(input: BuildMiddlewareInput<Definitions, ReducerPath, TagTypes>) {
  const { reducerPath, queryThunk } = input
  const actions = {
    invalidateTags: createAction<
      Array<TagTypes | FullTagDescription<TagTypes>>
    >(`${reducerPath}/invalidateTags`),
  }

  const middlewares = [
    buildDevMiddleware,
    buildCacheCollection,
    buildInvalidationByTags,
    buildPolling,
    buildWindowEventHandling,
    buildCacheLifecycle,
    buildQueryLifecycle,
  ].map((build) =>
    build({
      ...(input as any as BuildMiddlewareInput<
        EndpointDefinitions,
        string,
        string
      >),
      refetchQuery,
    })
  )
  const middleware: Middleware<
    {},
    RootState<Definitions, string, ReducerPath>,
    ThunkDispatch<any, any, AnyAction>
  > = (mwApi) => (next) => {
    const applied = compose<typeof next>(
      ...middlewares.map((middleware) => middleware(mwApi))
    )(next)
    return (action) => {
      if (mwApi.getState()[reducerPath]) {
        return applied(action)
      }
      return next(action)
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
