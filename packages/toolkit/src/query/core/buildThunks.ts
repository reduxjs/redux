import type { InternalSerializeQueryArgs } from '../defaultSerializeQueryArgs'
import type { Api, ApiContext } from '../apiTypes'
import type {
  BaseQueryFn,
  BaseQueryError,
  QueryReturnValue,
} from '../baseQueryTypes'
import { BaseQueryArg } from '../baseQueryTypes'
import type { RootState, QueryKeys, QuerySubstateIdentifier } from './apiState'
import { QueryStatus, CombinedState } from './apiState'
import type { StartQueryActionCreatorOptions } from './buildInitiate'
import type {
  AssertTagTypes,
  EndpointDefinition,
  EndpointDefinitions,
  MutationDefinition,
  QueryArgFrom,
  QueryDefinition,
  ResultTypeFrom,
} from '../endpointDefinitions'
import { calculateProvidedBy, FullTagDescription } from '../endpointDefinitions'
import type { AsyncThunkPayloadCreator, Draft } from '@reduxjs/toolkit'
import {
  isAllOf,
  isFulfilled,
  isPending,
  isRejected,
  isRejectedWithValue,
} from '@reduxjs/toolkit'
import type { Patch } from 'immer'
import { isDraftable, produceWithPatches } from 'immer'
import type {
  AnyAction,
  ThunkAction,
  ThunkDispatch,
  AsyncThunk,
} from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { HandledError } from '../HandledError'

import type { ApiEndpointQuery, PrefetchOptions } from './module'
import type { UnwrapPromise } from '../tsHelpers'

declare module './module' {
  export interface ApiEndpointQuery<
    Definition extends QueryDefinition<any, any, any, any, any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Definitions extends EndpointDefinitions
  > extends Matchers<QueryThunk, Definition> {}

  export interface ApiEndpointMutation<
    Definition extends MutationDefinition<any, any, any, any, any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Definitions extends EndpointDefinitions
  > extends Matchers<MutationThunk, Definition> {}
}

type EndpointThunk<
  Thunk extends QueryThunk | MutationThunk,
  Definition extends EndpointDefinition<any, any, any, any>
> = Definition extends EndpointDefinition<
  infer QueryArg,
  infer BaseQueryFn,
  any,
  infer ResultType
>
  ? Thunk extends AsyncThunk<unknown, infer ATArg, infer ATConfig>
    ? AsyncThunk<
        ResultType,
        ATArg & { originalArgs: QueryArg },
        ATConfig & { rejectValue: BaseQueryError<BaseQueryFn> }
      >
    : never
  : never

export type PendingAction<
  Thunk extends QueryThunk | MutationThunk,
  Definition extends EndpointDefinition<any, any, any, any>
> = ReturnType<EndpointThunk<Thunk, Definition>['pending']>

export type FulfilledAction<
  Thunk extends QueryThunk | MutationThunk,
  Definition extends EndpointDefinition<any, any, any, any>
> = ReturnType<EndpointThunk<Thunk, Definition>['fulfilled']>

export type RejectedAction<
  Thunk extends QueryThunk | MutationThunk,
  Definition extends EndpointDefinition<any, any, any, any>
> = ReturnType<EndpointThunk<Thunk, Definition>['rejected']>

export type Matcher<M> = (value: any) => value is M

export interface Matchers<
  Thunk extends QueryThunk | MutationThunk,
  Definition extends EndpointDefinition<any, any, any, any>
> {
  matchPending: Matcher<PendingAction<Thunk, Definition>>
  matchFulfilled: Matcher<FulfilledAction<Thunk, Definition>>
  matchRejected: Matcher<RejectedAction<Thunk, Definition>>
}

export interface QueryThunkArg
  extends QuerySubstateIdentifier,
    StartQueryActionCreatorOptions {
  originalArgs: unknown
  endpointName: string
}

export interface MutationThunkArg {
  originalArgs: unknown
  endpointName: string
  track?: boolean
}

export type ThunkResult = unknown

export type ThunkApiMetaConfig = {
  pendingMeta: { startedTimeStamp: number }
  fulfilledMeta: {
    fulfilledTimeStamp: number
    baseQueryMeta: unknown
  }
  rejectedMeta: {
    baseQueryMeta: unknown
  }
}
export type QueryThunk = AsyncThunk<
  ThunkResult,
  QueryThunkArg,
  ThunkApiMetaConfig
>
export type MutationThunk = AsyncThunk<
  ThunkResult,
  MutationThunkArg,
  ThunkApiMetaConfig
>

function defaultTransformResponse(baseQueryReturnValue: unknown) {
  return baseQueryReturnValue
}

export type MaybeDrafted<T> = T | Draft<T>
export type Recipe<T> = (data: MaybeDrafted<T>) => void | MaybeDrafted<T>

export type PatchQueryDataThunk<
  Definitions extends EndpointDefinitions,
  PartialState
> = <EndpointName extends QueryKeys<Definitions>>(
  endpointName: EndpointName,
  args: QueryArgFrom<Definitions[EndpointName]>,
  patches: readonly Patch[]
) => ThunkAction<void, PartialState, any, AnyAction>

export type UpdateQueryDataThunk<
  Definitions extends EndpointDefinitions,
  PartialState
> = <EndpointName extends QueryKeys<Definitions>>(
  endpointName: EndpointName,
  args: QueryArgFrom<Definitions[EndpointName]>,
  updateRecipe: Recipe<ResultTypeFrom<Definitions[EndpointName]>>
) => ThunkAction<PatchCollection, PartialState, any, AnyAction>

/**
 * An object returned from dispatching a `api.util.updateQueryData` call.
 */
export type PatchCollection = {
  /**
   * An `immer` Patch describing the cache update.
   */
  patches: Patch[]
  /**
   * An `immer` Patch to revert the cache update.
   */
  inversePatches: Patch[]
  /**
   * A function that will undo the cache update.
   */
  undo: () => void
}

export function buildThunks<
  BaseQuery extends BaseQueryFn,
  ReducerPath extends string,
  Definitions extends EndpointDefinitions
>({
  reducerPath,
  baseQuery,
  context: { endpointDefinitions },
  serializeQueryArgs,
  api,
}: {
  baseQuery: BaseQuery
  reducerPath: ReducerPath
  context: ApiContext<Definitions>
  serializeQueryArgs: InternalSerializeQueryArgs
  api: Api<BaseQuery, Definitions, ReducerPath, any>
}) {
  type State = RootState<any, string, ReducerPath>

  const patchQueryData: PatchQueryDataThunk<EndpointDefinitions, State> =
    (endpointName, args, patches) => (dispatch) => {
      const endpointDefinition = endpointDefinitions[endpointName]
      dispatch(
        api.internalActions.queryResultPatched({
          queryCacheKey: serializeQueryArgs({
            queryArgs: args,
            endpointDefinition,
            endpointName,
          }),
          patches,
        })
      )
    }

  const updateQueryData: UpdateQueryDataThunk<EndpointDefinitions, State> =
    (endpointName, args, updateRecipe) => (dispatch, getState) => {
      const currentState = (
        api.endpoints[endpointName] as ApiEndpointQuery<any, any>
      ).select(args)(getState())
      let ret: PatchCollection = {
        patches: [],
        inversePatches: [],
        undo: () =>
          dispatch(
            api.util.patchQueryData(endpointName, args, ret.inversePatches)
          ),
      }
      if (currentState.status === QueryStatus.uninitialized) {
        return ret
      }
      if ('data' in currentState) {
        if (isDraftable(currentState.data)) {
          const [, patches, inversePatches] = produceWithPatches(
            currentState.data,
            updateRecipe
          )
          ret.patches.push(...patches)
          ret.inversePatches.push(...inversePatches)
        } else {
          const value = updateRecipe(currentState.data)
          ret.patches.push({ op: 'replace', path: [], value })
          ret.inversePatches.push({
            op: 'replace',
            path: [],
            value: currentState.data,
          })
        }
      }

      dispatch(api.util.patchQueryData(endpointName, args, ret.patches))

      return ret
    }

  const executeEndpoint: AsyncThunkPayloadCreator<
    ThunkResult,
    QueryThunkArg | MutationThunkArg,
    ThunkApiMetaConfig & { state: RootState<any, string, ReducerPath> }
  > = async (
    arg,
    { signal, rejectWithValue, fulfillWithValue, dispatch, getState, extra }
  ) => {
    const endpointDefinition = endpointDefinitions[arg.endpointName]

    try {
      let transformResponse: (baseQueryReturnValue: any, meta: any) => any =
        defaultTransformResponse
      let result: QueryReturnValue
      const baseQueryApi = {
        signal,
        dispatch,
        getState,
        extra,
      }
      if (endpointDefinition.query) {
        result = await baseQuery(
          endpointDefinition.query(arg.originalArgs),
          baseQueryApi,
          endpointDefinition.extraOptions as any
        )

        if (endpointDefinition.transformResponse) {
          transformResponse = endpointDefinition.transformResponse
        }
      } else {
        result = await endpointDefinition.queryFn(
          arg.originalArgs,
          baseQueryApi,
          endpointDefinition.extraOptions as any,
          (arg) =>
            baseQuery(arg, baseQueryApi, endpointDefinition.extraOptions as any)
        )
      }
      if (result.error) throw new HandledError(result.error, result.meta)

      return fulfillWithValue(
        await transformResponse(result.data, result.meta),
        {
          fulfilledTimeStamp: Date.now(),
          baseQueryMeta: result.meta,
        }
      )
    } catch (error) {
      if (error instanceof HandledError) {
        return rejectWithValue(error.value, { baseQueryMeta: error.meta })
      }
      if (
        typeof process !== 'undefined' &&
        process.env.NODE_ENV === 'development'
      ) {
        console.error(
          `An unhandled error occured processing a request for the endpoint "${arg.endpointName}".
In the case of an unhandled error, no tags will be "provided" or "invalidated".`,
          error
        )
      } else {
        console.error(error)
      }
      throw error
    }
  }

  const queryThunk = createAsyncThunk<
    ThunkResult,
    QueryThunkArg,
    ThunkApiMetaConfig & { state: RootState<any, string, ReducerPath> }
  >(`${reducerPath}/executeQuery`, executeEndpoint, {
    getPendingMeta() {
      return { startedTimeStamp: Date.now() }
    },
    condition(arg, { getState }) {
      const state = getState()[reducerPath]
      const requestState = state?.queries?.[arg.queryCacheKey]
      const baseFetchOnMountOrArgChange = state.config.refetchOnMountOrArgChange

      const fulfilledVal = requestState?.fulfilledTimeStamp
      const refetchVal =
        arg.forceRefetch ?? (arg.subscribe && baseFetchOnMountOrArgChange)

      // Don't retry a request that's currently in-flight
      if (requestState?.status === 'pending') return false

      // Pull from the cache unless we explicitly force refetch or qualify based on time
      if (fulfilledVal) {
        if (refetchVal) {
          // Return if its true or compare the dates because it must be a number
          return (
            refetchVal === true ||
            (Number(new Date()) - Number(fulfilledVal)) / 1000 >= refetchVal
          )
        }
        // Value is cached and we didn't specify to refresh, skip it.
        return false
      }

      return true
    },
    dispatchConditionRejection: true,
  })

  const mutationThunk = createAsyncThunk<
    ThunkResult,
    MutationThunkArg,
    ThunkApiMetaConfig & { state: RootState<any, string, ReducerPath> }
  >(`${reducerPath}/executeMutation`, executeEndpoint, {
    getPendingMeta() {
      return { startedTimeStamp: Date.now() }
    },
  })

  const hasTheForce = (options: any): options is { force: boolean } =>
    'force' in options
  const hasMaxAge = (
    options: any
  ): options is { ifOlderThan: false | number } => 'ifOlderThan' in options

  const prefetch =
    <EndpointName extends QueryKeys<Definitions>>(
      endpointName: EndpointName,
      arg: any,
      options: PrefetchOptions
    ): ThunkAction<void, any, any, AnyAction> =>
    (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
      const force = hasTheForce(options) && options.force
      const maxAge = hasMaxAge(options) && options.ifOlderThan

      const queryAction = (force: boolean = true) =>
        (api.endpoints[endpointName] as ApiEndpointQuery<any, any>).initiate(
          arg,
          { forceRefetch: force }
        )
      const latestStateValue = (
        api.endpoints[endpointName] as ApiEndpointQuery<any, any>
      ).select(arg)(getState())

      if (force) {
        dispatch(queryAction())
      } else if (maxAge) {
        const lastFulfilledTs = latestStateValue?.fulfilledTimeStamp
        if (!lastFulfilledTs) {
          dispatch(queryAction())
          return
        }
        const shouldRetrigger =
          (Number(new Date()) - Number(new Date(lastFulfilledTs))) / 1000 >=
          maxAge
        if (shouldRetrigger) {
          dispatch(queryAction())
        }
      } else {
        // If prefetching with no options, just let it try
        dispatch(queryAction(false))
      }
    }

  function matchesEndpoint(endpointName: string) {
    return (action: any): action is AnyAction =>
      action?.meta?.arg?.endpointName === endpointName
  }

  function buildMatchThunkActions<
    Thunk extends
      | AsyncThunk<any, QueryThunkArg, ThunkApiMetaConfig>
      | AsyncThunk<any, MutationThunkArg, ThunkApiMetaConfig>
  >(thunk: Thunk, endpointName: string) {
    return {
      matchPending: isAllOf(isPending(thunk), matchesEndpoint(endpointName)),
      matchFulfilled: isAllOf(
        isFulfilled(thunk),
        matchesEndpoint(endpointName)
      ),
      matchRejected: isAllOf(isRejected(thunk), matchesEndpoint(endpointName)),
    } as Matchers<Thunk, any>
  }

  return {
    queryThunk,
    mutationThunk,
    prefetch,
    updateQueryData,
    patchQueryData,
    buildMatchThunkActions,
  }
}

export function calculateProvidedByThunk(
  action: UnwrapPromise<
    ReturnType<ReturnType<QueryThunk>> | ReturnType<ReturnType<MutationThunk>>
  >,
  type: 'providesTags' | 'invalidatesTags',
  endpointDefinitions: EndpointDefinitions,
  assertTagType: AssertTagTypes
) {
  return calculateProvidedBy(
    endpointDefinitions[action.meta.arg.endpointName][type],
    isFulfilled(action) ? action.payload : undefined,
    isRejectedWithValue(action) ? action.payload : undefined,
    action.meta.arg.originalArgs,
    assertTagType
  )
}
