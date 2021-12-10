import { createNextState, createSelector } from '@reduxjs/toolkit'
import type {
  MutationSubState,
  QuerySubState,
  RootState as _RootState,
  RequestStatusFlags,
  QueryCacheKey,
} from './apiState'
import { QueryStatus, getRequestStatusFlags } from './apiState'
import type {
  EndpointDefinitions,
  QueryDefinition,
  MutationDefinition,
  QueryArgFrom,
  TagTypesFrom,
  ReducerPathFrom,
  TagDescription,
} from '../endpointDefinitions'
import { expandTagDescription } from '../endpointDefinitions'
import type { InternalSerializeQueryArgs } from '../defaultSerializeQueryArgs'
import { getMutationCacheKey } from './buildSlice'
import { flatten } from '../utils'

export type SkipToken = typeof skipToken
/**
 * Can be passed into `useQuery`, `useQueryState` or `useQuerySubscription`
 * instead of the query argument to get the same effect as if setting
 * `skip: true` in the query options.
 *
 * Useful for scenarios where a query should be skipped when `arg` is `undefined`
 * and TypeScript complains about it because `arg` is not allowed to be passed
 * in as `undefined`, such as
 *
 * ```ts
 * // codeblock-meta title="will error if the query argument is not allowed to be undefined" no-transpile
 * useSomeQuery(arg, { skip: !!arg })
 * ```
 *
 * ```ts
 * // codeblock-meta title="using skipToken instead" no-transpile
 * useSomeQuery(arg ?? skipToken)
 * ```
 *
 * If passed directly into a query or mutation selector, that selector will always
 * return an uninitialized state.
 */
export const skipToken = /* @__PURE__ */ Symbol.for('RTKQ/skipToken')
/** @deprecated renamed to `skipToken` */
export const skipSelector = skipToken

declare module './module' {
  export interface ApiEndpointQuery<
    Definition extends QueryDefinition<any, any, any, any, any>,
    Definitions extends EndpointDefinitions
  > {
    select: QueryResultSelectorFactory<
      Definition,
      _RootState<
        Definitions,
        TagTypesFrom<Definition>,
        ReducerPathFrom<Definition>
      >
    >
  }

  export interface ApiEndpointMutation<
    Definition extends MutationDefinition<any, any, any, any, any>,
    Definitions extends EndpointDefinitions
  > {
    select: MutationResultSelectorFactory<
      Definition,
      _RootState<
        Definitions,
        TagTypesFrom<Definition>,
        ReducerPathFrom<Definition>
      >
    >
  }
}

type QueryResultSelectorFactory<
  Definition extends QueryDefinition<any, any, any, any>,
  RootState
> = (
  queryArg: QueryArgFrom<Definition> | SkipToken
) => (state: RootState) => QueryResultSelectorResult<Definition>

export type QueryResultSelectorResult<
  Definition extends QueryDefinition<any, any, any, any>
> = QuerySubState<Definition> & RequestStatusFlags

type MutationResultSelectorFactory<
  Definition extends MutationDefinition<any, any, any, any>,
  RootState
> = (
  requestId:
    | string
    | { requestId: string | undefined; fixedCacheKey: string | undefined }
    | SkipToken
) => (state: RootState) => MutationResultSelectorResult<Definition>

export type MutationResultSelectorResult<
  Definition extends MutationDefinition<any, any, any, any>
> = MutationSubState<Definition> & RequestStatusFlags

const initialSubState: QuerySubState<any> = {
  status: QueryStatus.uninitialized as const,
}

// abuse immer to freeze default states
const defaultQuerySubState = /* @__PURE__ */ createNextState(
  initialSubState,
  () => {}
)
const defaultMutationSubState = /* @__PURE__ */ createNextState(
  initialSubState as MutationSubState<any>,
  () => {}
)

export function buildSelectors<
  Definitions extends EndpointDefinitions,
  ReducerPath extends string
>({
  serializeQueryArgs,
  reducerPath,
}: {
  serializeQueryArgs: InternalSerializeQueryArgs
  reducerPath: ReducerPath
}) {
  type RootState = _RootState<Definitions, string, string>

  return { buildQuerySelector, buildMutationSelector, selectInvalidatedBy }

  function withRequestFlags<T extends { status: QueryStatus }>(
    substate: T
  ): T & RequestStatusFlags {
    return {
      ...substate,
      ...getRequestStatusFlags(substate.status),
    }
  }

  function selectInternalState(rootState: RootState) {
    const state = rootState[reducerPath]
    if (process.env.NODE_ENV !== 'production') {
      if (!state) {
        if ((selectInternalState as any).triggered) return state
        ;(selectInternalState as any).triggered = true
        console.error(
          `Error: No data found at \`state.${reducerPath}\`. Did you forget to add the reducer to the store?`
        )
      }
    }
    return state
  }

  function buildQuerySelector(
    endpointName: string,
    endpointDefinition: QueryDefinition<any, any, any, any>
  ) {
    return ((queryArgs: any) => {
      const selectQuerySubState = createSelector(
        selectInternalState,
        (internalState) =>
          (queryArgs === skipToken
            ? undefined
            : internalState?.queries?.[
                serializeQueryArgs({
                  queryArgs,
                  endpointDefinition,
                  endpointName,
                })
              ]) ?? defaultQuerySubState
      )
      return createSelector(selectQuerySubState, withRequestFlags)
    }) as QueryResultSelectorFactory<any, RootState>
  }

  function buildMutationSelector() {
    return ((id) => {
      let mutationId: string | typeof skipToken
      if (typeof id === 'object') {
        mutationId = getMutationCacheKey(id) ?? skipToken
      } else {
        mutationId = id
      }
      const selectMutationSubstate = createSelector(
        selectInternalState,
        (internalState) =>
          (mutationId === skipToken
            ? undefined
            : internalState?.mutations?.[mutationId]) ?? defaultMutationSubState
      )
      return createSelector(selectMutationSubstate, withRequestFlags)
    }) as MutationResultSelectorFactory<any, RootState>
  }

  function selectInvalidatedBy(
    state: RootState,
    tags: ReadonlyArray<TagDescription<string>>
  ): Array<{
    endpointName: string
    originalArgs: any
    queryCacheKey: QueryCacheKey
  }> {
    const apiState = state[reducerPath]
    const toInvalidate = new Set<QueryCacheKey>()
    for (const tag of tags.map(expandTagDescription)) {
      const provided = apiState.provided[tag.type]
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

    return flatten(
      Array.from(toInvalidate.values()).map((queryCacheKey) => {
        const querySubState = apiState.queries[queryCacheKey]
        return querySubState
          ? [
              {
                queryCacheKey,
                endpointName: querySubState.endpointName!,
                originalArgs: querySubState.originalArgs,
              },
            ]
          : []
      })
    )
  }
}
