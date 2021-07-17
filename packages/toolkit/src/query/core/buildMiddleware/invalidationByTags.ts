import { isAnyOf, isFulfilled, isRejectedWithValue } from '@reduxjs/toolkit'

import type { FullTagDescription } from '../../endpointDefinitions'
import { calculateProvidedBy } from '../../endpointDefinitions'
import { flatten } from '../../utils'
import type { QueryCacheKey } from '../apiState'
import { QueryStatus } from '../apiState'
import { calculateProvidedByThunk } from '../buildThunks'
import type { SubMiddlewareApi, SubMiddlewareBuilder } from './types'

export const build: SubMiddlewareBuilder = ({
  reducerPath,
  context,
  context: { endpointDefinitions },
  mutationThunk,
  api,
  assertTagType,
  refetchQuery,
}) => {
  const { removeQueryResult } = api.internalActions

  return (mwApi) =>
    (next) =>
    (action): any => {
      const result = next(action)

      if (
        isAnyOf(
          isFulfilled(mutationThunk),
          isRejectedWithValue(mutationThunk)
        )(action)
      ) {
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
            assertTagType
          ),
          mwApi
        )
      }

      return result
    }

  function invalidateTags(
    tags: readonly FullTagDescription<string>[],
    api: SubMiddlewareApi
  ) {
    const state = api.getState()[reducerPath]

    const toInvalidate = new Set<QueryCacheKey>()
    for (const tag of tags) {
      const provided = state.provided[tag.type]
      if (!provided) {
        continue
      }

      let invalidateSubscriptions =
        (tag.id !== undefined
          ? // id given: invalidate all queries that provide this type & id
            provided[tag.id]
          : // no id: invalidate all queries that provide this type
            flatten(Object.values(provided))) ?? []

      for (const invalidate of invalidateSubscriptions) {
        toInvalidate.add(invalidate)
      }
    }

    context.batch(() => {
      const valuesArray = Array.from(toInvalidate.values())
      for (const queryCacheKey of valuesArray) {
        const querySubState = state.queries[queryCacheKey]
        const subscriptionSubState = state.subscriptions[queryCacheKey]
        if (querySubState && subscriptionSubState) {
          if (Object.keys(subscriptionSubState).length === 0) {
            api.dispatch(removeQueryResult({ queryCacheKey }))
          } else if (querySubState.status !== QueryStatus.uninitialized) {
            api.dispatch(refetchQuery(querySubState, queryCacheKey))
          } else {
          }
        }
      }
    })
  }
}
