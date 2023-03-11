import { isAnyOf, isFulfilled, isRejectedWithValue } from '@reduxjs/toolkit'

import type { FullTagDescription } from '../../endpointDefinitions'
import { calculateProvidedBy } from '../../endpointDefinitions'
import type { QueryCacheKey } from '../apiState'
import { QueryStatus } from '../apiState'
import { calculateProvidedByThunk } from '../buildThunks'
import type {
  SubMiddlewareApi,
  InternalHandlerBuilder,
  ApiMiddlewareInternalHandler,
} from './types'

export const buildInvalidationByTagsHandler: InternalHandlerBuilder = ({
  reducerPath,
  context,
  context: { endpointDefinitions },
  mutationThunk,
  api,
  assertTagType,
  refetchQuery,
}) => {
  const { removeQueryResult } = api.internalActions
  const isThunkActionWithTags = isAnyOf(
    isFulfilled(mutationThunk),
    isRejectedWithValue(mutationThunk)
  )

  const handler: ApiMiddlewareInternalHandler = (action, mwApi) => {
    if (isThunkActionWithTags(action)) {
      invalidateTags(
        calculateProvidedByThunk(
          action,
          'invalidatesTags',
          endpointDefinitions,
          assertTagType
        ),
        mwApi
      )
    }

    if (api.util.invalidateTags.match(action)) {
      invalidateTags(
        calculateProvidedBy(
          action.payload,
          undefined,
          undefined,
          undefined,
          undefined,
          assertTagType
        ),
        mwApi
      )
    }
  }

  function invalidateTags(
    tags: readonly FullTagDescription<string>[],
    mwApi: SubMiddlewareApi
  ) {
    const rootState = mwApi.getState()
    const state = rootState[reducerPath]

    const toInvalidate = api.util.selectInvalidatedBy(rootState, tags)

    context.batch(() => {
      const valuesArray = Array.from(toInvalidate.values())
      for (const { queryCacheKey } of valuesArray) {
        const querySubState = state.queries[queryCacheKey]
        const subscriptionSubState = state.subscriptions[queryCacheKey] ?? {}

        if (querySubState) {
          if (Object.keys(subscriptionSubState).length === 0) {
            mwApi.dispatch(
              removeQueryResult({
                queryCacheKey: queryCacheKey as QueryCacheKey,
              })
            )
          } else if (querySubState.status !== QueryStatus.uninitialized) {
            mwApi.dispatch(refetchQuery(querySubState, queryCacheKey))
          }
        }
      }
    })
  }

  return handler
}
