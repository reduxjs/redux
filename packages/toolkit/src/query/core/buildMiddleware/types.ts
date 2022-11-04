import type {
  AnyAction,
  AsyncThunkAction,
  Dispatch,
  Middleware,
  MiddlewareAPI,
  ThunkDispatch,
} from '@reduxjs/toolkit'

import type { Api, ApiContext } from '../../apiTypes'
import type {
  AssertTagTypes,
  EndpointDefinitions,
} from '../../endpointDefinitions'
import type {
  QueryStatus,
  QuerySubState,
  RootState,
  SubscriptionState,
} from '../apiState'
import type {
  MutationThunk,
  QueryThunk,
  QueryThunkArg,
  ThunkResult,
} from '../buildThunks'

export type QueryStateMeta<T> = Record<string, undefined | T>
export type TimeoutId = ReturnType<typeof setTimeout>

export interface InternalMiddlewareState {
  currentSubscriptions: SubscriptionState
}

export interface BuildMiddlewareInput<
  Definitions extends EndpointDefinitions,
  ReducerPath extends string,
  TagTypes extends string
> {
  reducerPath: ReducerPath
  context: ApiContext<Definitions>
  queryThunk: QueryThunk
  mutationThunk: MutationThunk
  api: Api<any, Definitions, ReducerPath, TagTypes>
  assertTagType: AssertTagTypes
}

export type SubMiddlewareApi = MiddlewareAPI<
  ThunkDispatch<any, any, AnyAction>,
  RootState<EndpointDefinitions, string, string>
>

export interface BuildSubMiddlewareInput
  extends BuildMiddlewareInput<EndpointDefinitions, string, string> {
  internalState: InternalMiddlewareState
  refetchQuery(
    querySubState: Exclude<
      QuerySubState<any>,
      { status: QueryStatus.uninitialized }
    >,
    queryCacheKey: string,
    override?: Partial<QueryThunkArg>
  ): AsyncThunkAction<ThunkResult, QueryThunkArg, {}>
}

export type SubMiddlewareBuilder = (
  input: BuildSubMiddlewareInput
) => Middleware<
  {},
  RootState<EndpointDefinitions, string, string>,
  ThunkDispatch<any, any, AnyAction>
>

export type ApiMiddlewareInternalHandler<ReturnType = void> = (
  action: AnyAction,
  mwApi: SubMiddlewareApi & { next: Dispatch<AnyAction> },
  prevState: RootState<EndpointDefinitions, string, string>
) => ReturnType

export type InternalHandlerBuilder<ReturnType = void> = (
  input: BuildSubMiddlewareInput
) => ApiMiddlewareInternalHandler<ReturnType>

export interface PromiseConstructorWithKnownReason {
  /**
   * Creates a new Promise with a known rejection reason.
   * @param executor A callback used to initialize the promise. This callback is passed two arguments:
   * a resolve callback used to resolve the promise with a value or the result of another promise,
   * and a reject callback used to reject the promise with a provided reason or error.
   */
  new <T, R>(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: R) => void
    ) => void
  ): PromiseWithKnownReason<T, R>
}

export interface PromiseWithKnownReason<T, R>
  extends Omit<Promise<T>, 'then' | 'catch'> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: R) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2>

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: R) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<T | TResult>
}
