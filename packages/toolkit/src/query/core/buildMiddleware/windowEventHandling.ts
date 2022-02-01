import { QueryStatus } from '../apiState'
import type { QueryCacheKey } from '../apiState'
import { onFocus, onOnline } from '../setupListeners'
import type { SubMiddlewareApi, SubMiddlewareBuilder } from './types'

export const build: SubMiddlewareBuilder = ({
  reducerPath,
  context,
  api,
  refetchQuery,
}) => {
  const { removeQueryResult } = api.internalActions

  return (mwApi) =>
    (next) =>
    (action): any => {
      const result = next(action)

      if (onFocus.match(action)) {
        refetchValidQueries(mwApi, 'refetchOnFocus')
      }
      if (onOnline.match(action)) {
        refetchValidQueries(mwApi, 'refetchOnReconnect')
      }

      return result
    }

  function refetchValidQueries(
    api: SubMiddlewareApi,
    type: 'refetchOnFocus' | 'refetchOnReconnect'
  ) {
    const state = api.getState()[reducerPath]
    const queries = state.queries
    const subscriptions = state.subscriptions

    context.batch(() => {
      for (const queryCacheKey of Object.keys(subscriptions)) {
        const querySubState = queries[queryCacheKey]
        const subscriptionSubState = subscriptions[queryCacheKey]

        if (!subscriptionSubState || !querySubState) continue

        const shouldRefetch =
          Object.values(subscriptionSubState).some(
            (sub) => sub[type] === true
          ) ||
          (Object.values(subscriptionSubState).every(
            (sub) => sub[type] === undefined
          ) &&
            state.config[type])

        if (shouldRefetch) {
          if (Object.keys(subscriptionSubState).length === 0) {
            api.dispatch(
              removeQueryResult({
                queryCacheKey: queryCacheKey as QueryCacheKey,
              })
            )
          } else if (querySubState.status !== QueryStatus.uninitialized) {
            api.dispatch(refetchQuery(querySubState, queryCacheKey))
          }
        }
      }
    })
  }
}
