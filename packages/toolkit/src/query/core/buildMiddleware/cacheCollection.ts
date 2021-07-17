import type { BaseQueryFn } from '../../baseQueryTypes'
import type { QueryDefinition } from '../../endpointDefinitions'
import type { QueryCacheKey } from '../apiState'
import { QuerySubstateIdentifier } from '../apiState'
import type {
  QueryStateMeta,
  SubMiddlewareApi,
  SubMiddlewareBuilder,
  TimeoutId,
} from './types'

export type ReferenceCacheCollection = never

declare module '../../endpointDefinitions' {
  interface QueryExtraOptions<
    TagTypes extends string,
    ResultType,
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ReducerPath extends string = string
  > {
    /**
     * Overrides the api-wide definition of `keepUnusedDataFor` for this endpoint only. _(This value is in seconds.)_
     *
     * This is how long RTK Query will keep your data cached for **after** the last component unsubscribes. For example, if you query an endpoint, then unmount the component, then mount another component that makes the same request within the given time frame, the most recent value will be served from the cache.
     */
    keepUnusedDataFor?: number
  }
}

export const build: SubMiddlewareBuilder = ({ reducerPath, api, context }) => {
  const { removeQueryResult, unsubscribeQueryResult } = api.internalActions

  return (mwApi) => {
    const currentRemovalTimeouts: QueryStateMeta<TimeoutId> = {}

    return (next) =>
      (action): any => {
        const result = next(action)

        if (unsubscribeQueryResult.match(action)) {
          const state = mwApi.getState()[reducerPath]
          const { queryCacheKey } = action.payload

          const endpointDefinition = context.endpointDefinitions[
            state.queries[queryCacheKey]?.endpointName!
          ] as QueryDefinition<any, any, any, any>

          handleUnsubscribe(
            queryCacheKey,
            mwApi,
            endpointDefinition?.keepUnusedDataFor ??
              state.config.keepUnusedDataFor
          )
        }

        if (api.util.resetApiState.match(action)) {
          for (const [key, timeout] of Object.entries(currentRemovalTimeouts)) {
            if (timeout) clearTimeout(timeout)
            delete currentRemovalTimeouts[key]
          }
        }

        return result
      }

    function handleUnsubscribe(
      queryCacheKey: QueryCacheKey,
      api: SubMiddlewareApi,
      keepUnusedDataFor: number
    ) {
      const currentTimeout = currentRemovalTimeouts[queryCacheKey]
      if (currentTimeout) {
        clearTimeout(currentTimeout)
      }
      currentRemovalTimeouts[queryCacheKey] = setTimeout(() => {
        const subscriptions =
          api.getState()[reducerPath].subscriptions[queryCacheKey]
        if (!subscriptions || Object.keys(subscriptions).length === 0) {
          api.dispatch(removeQueryResult({ queryCacheKey }))
        }
        delete currentRemovalTimeouts![queryCacheKey]
      }, keepUnusedDataFor * 1000)
    }
  }
}
