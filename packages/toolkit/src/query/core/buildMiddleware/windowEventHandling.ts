import { QueryStatus } from '../apiState'
import type { QueryCacheKey } from '../apiState'
import { onFocus, onOnline } from '../setupListeners'
import type {
  ApiMiddlewareInternalHandler,
  InternalHandlerBuilder,
  InternalMiddlewareState,
  SubMiddlewareApi,
} from './types'

export const buildWindowEventHandler: InternalHandlerBuilder = ({
  reducerPath,
  context,
  api,
  refetchQuery,
}) => {
  const { removeQueryResult } = api.internalActions

  const handler: ApiMiddlewareInternalHandler = (
    action,
    mwApi,
    internalState
  ) => {
    if (onFocus.match(action)) {
      refetchValidQueries(mwApi, 'refetchOnFocus', internalState)
    }
    if (onOnline.match(action)) {
      refetchValidQueries(mwApi, 'refetchOnReconnect', internalState)
    }
  }

  function refetchValidQueries(
    api: SubMiddlewareApi,
    type: 'refetchOnFocus' | 'refetchOnReconnect',
    internalState: InternalMiddlewareState
  ) {
    const state = api.getState()[reducerPath]
    const queries = state.queries
    const subscriptions = internalState.currentSubscriptions

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

  return handler
}
