import { createNextState, createSelector } from '@reduxjs/toolkit'
import type {
  MutationSubState,
  QuerySubState,
  RootState as _RootState,
  RequestStatusFlags,
} from './apiState'
import { QueryStatus, getRequestStatusFlags } from './apiState'
import type {
  EndpointDefinitions,
  QueryDefinition,
  MutationDefinition,
  QueryArgFrom,
  TagTypesFrom,
  ReducerPathFrom,
} from '../endpointDefinitions'
import type { InternalSerializeQueryArgs } from '../defaultSerializeQueryArgs'

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
  requestId: string | SkipToken
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

  return { buildQuerySelector, buildMutationSelector }

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
  ): QueryResultSelectorFactory<any, RootState> {
    return (queryArgs) => {
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
    }
  }

  function buildMutationSelector(): MutationResultSelectorFactory<
    any,
    RootState
  > {
    return (mutationId) => {
      const selectMutationSubstate = createSelector(
        selectInternalState,
        (internalState) =>
          (mutationId === skipToken
            ? undefined
            : internalState?.mutations?.[mutationId]) ?? defaultMutationSubState
      )
      return createSelector(selectMutationSubstate, withRequestFlags)
    }
  }
}
