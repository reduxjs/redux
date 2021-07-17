import type { Reducer } from 'redux'
import type {
  ActionCreatorWithoutPayload,
  PayloadAction,
  PayloadActionCreator,
  PrepareAction,
  _ActionCreatorWithPreparedPayload,
} from './createAction'
import { createAction } from './createAction'
import type { CaseReducer, CaseReducers } from './createReducer'
import { createReducer } from './createReducer'
import type { ActionReducerMapBuilder } from './mapBuilders'
import { executeReducerBuilderCallback } from './mapBuilders'
import type { NoInfer } from './tsHelpers'

/**
 * An action creator attached to a slice.
 *
 * @deprecated please use PayloadActionCreator directly
 *
 * @public
 */
export type SliceActionCreator<P> = PayloadActionCreator<P>

/**
 * The return value of `createSlice`
 *
 * @public
 */
export interface Slice<
  State = any,
  CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>,
  Name extends string = string
> {
  /**
   * The slice name.
   */
  name: Name

  /**
   * The slice's reducer.
   */
  reducer: Reducer<State>

  /**
   * Action creators for the types of actions that are handled by the slice
   * reducer.
   */
  actions: CaseReducerActions<CaseReducers>

  /**
   * The individual case reducer functions that were passed in the `reducers` parameter.
   * This enables reuse and testing if they were defined inline when calling `createSlice`.
   */
  caseReducers: SliceDefinedCaseReducers<CaseReducers>
}

/**
 * Options for `createSlice()`.
 *
 * @public
 */
export interface CreateSliceOptions<
  State = any,
  CR extends SliceCaseReducers<State> = SliceCaseReducers<State>,
  Name extends string = string
> {
  /**
   * The slice's name. Used to namespace the generated action types.
   */
  name: Name

  /**
   * The initial state to be returned by the slice reducer.
   */
  initialState: State

  /**
   * A mapping from action types to action-type-specific *case reducer*
   * functions. For every action type, a matching action creator will be
   * generated using `createAction()`.
   */
  reducers: ValidateSliceCaseReducers<State, CR>

  /**
   * A callback that receives a *builder* object to define
   * case reducers via calls to `builder.addCase(actionCreatorOrType, reducer)`.
   * 
   * Alternatively, a mapping from action types to action-type-specific *case reducer*
   * functions. These reducers should have existing action types used
   * as the keys, and action creators will _not_ be generated.
   * 
   * @example
```ts
import { createAction, createSlice, Action, AnyAction } from '@reduxjs/toolkit'
const incrementBy = createAction<number>('incrementBy')
const decrement = createAction('decrement')

interface RejectedAction extends Action {
  error: Error
}

function isRejectedAction(action: AnyAction): action is RejectedAction {
  return action.type.endsWith('rejected')
}

createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(incrementBy, (state, action) => {
        // action is inferred correctly here if using TS
      })
      // You can chain calls, or have separate `builder.addCase()` lines each time
      .addCase(decrement, (state, action) => {})
      // You can match a range of action types
      .addMatcher(
        isRejectedAction,
        // `action` will be inferred as a RejectedAction due to isRejectedAction being defined as a type guard
        (state, action) => {}
      )
      // and provide a default case if no other handlers matched
      .addDefaultCase((state, action) => {})
    }
})
```
   */
  extraReducers?:
    | CaseReducers<NoInfer<State>, any>
    | ((builder: ActionReducerMapBuilder<NoInfer<State>>) => void)
}

/**
 * A CaseReducer with a `prepare` method.
 *
 * @public
 */
export type CaseReducerWithPrepare<State, Action extends PayloadAction> = {
  reducer: CaseReducer<State, Action>
  prepare: PrepareAction<Action['payload']>
}

/**
 * The type describing a slice's `reducers` option.
 *
 * @public
 */
export type SliceCaseReducers<State> = {
  [K: string]:
    | CaseReducer<State, PayloadAction<any>>
    | CaseReducerWithPrepare<State, PayloadAction<any, string, any, any>>
}

/**
 * Derives the slice's `actions` property from the `reducers` options
 *
 * @public
 */
export type CaseReducerActions<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends { prepare: any }
    ? ActionCreatorForCaseReducerWithPrepare<CaseReducers[Type]>
    : ActionCreatorForCaseReducer<CaseReducers[Type]>
}

/**
 * Get a `PayloadActionCreator` type for a passed `CaseReducerWithPrepare`
 *
 * @internal
 */
type ActionCreatorForCaseReducerWithPrepare<CR extends { prepare: any }> =
  _ActionCreatorWithPreparedPayload<CR['prepare'], string>

/**
 * Get a `PayloadActionCreator` type for a passed `CaseReducer`
 *
 * @internal
 */
type ActionCreatorForCaseReducer<CR> = CR extends (
  state: any,
  action: infer Action
) => any
  ? Action extends { payload: infer P }
    ? PayloadActionCreator<P>
    : ActionCreatorWithoutPayload
  : ActionCreatorWithoutPayload

/**
 * Extracts the CaseReducers out of a `reducers` object, even if they are
 * tested into a `CaseReducerWithPrepare`.
 *
 * @internal
 */
type SliceDefinedCaseReducers<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends {
    reducer: infer Reducer
  }
    ? Reducer
    : CaseReducers[Type]
}

/**
 * Used on a SliceCaseReducers object.
 * Ensures that if a CaseReducer is a `CaseReducerWithPrepare`, that
 * the `reducer` and the `prepare` function use the same type of `payload`.
 *
 * Might do additional such checks in the future.
 *
 * This type is only ever useful if you want to write your own wrapper around
 * `createSlice`. Please don't use it otherwise!
 *
 * @public
 */
export type ValidateSliceCaseReducers<
  S,
  ACR extends SliceCaseReducers<S>
> = ACR &
  {
    [T in keyof ACR]: ACR[T] extends {
      reducer(s: S, action?: infer A): any
    }
      ? {
          prepare(...a: never[]): Omit<A, 'type'>
        }
      : {}
  }

function getType(slice: string, actionKey: string): string {
  return `${slice}/${actionKey}`
}

/**
 * A function that accepts an initial state, an object full of reducer
 * functions, and a "slice name", and automatically generates
 * action creators and action types that correspond to the
 * reducers and state.
 *
 * The `reducer` argument is passed to `createReducer()`.
 *
 * @public
 */
export function createSlice<
  State,
  CaseReducers extends SliceCaseReducers<State>,
  Name extends string = string
>(
  options: CreateSliceOptions<State, CaseReducers, Name>
): Slice<State, CaseReducers, Name> {
  const { name, initialState } = options
  if (!name) {
    throw new Error('`name` is a required option for createSlice')
  }
  const reducers = options.reducers || {}
  const [
    extraReducers = {},
    actionMatchers = [],
    defaultCaseReducer = undefined,
  ] =
    typeof options.extraReducers === 'function'
      ? executeReducerBuilderCallback(options.extraReducers)
      : [options.extraReducers]

  const reducerNames = Object.keys(reducers)

  const sliceCaseReducersByName: Record<string, CaseReducer> = {}
  const sliceCaseReducersByType: Record<string, CaseReducer> = {}
  const actionCreators: Record<string, Function> = {}

  reducerNames.forEach((reducerName) => {
    const maybeReducerWithPrepare = reducers[reducerName]
    const type = getType(name, reducerName)

    let caseReducer: CaseReducer<State, any>
    let prepareCallback: PrepareAction<any> | undefined

    if ('reducer' in maybeReducerWithPrepare) {
      caseReducer = maybeReducerWithPrepare.reducer
      prepareCallback = maybeReducerWithPrepare.prepare
    } else {
      caseReducer = maybeReducerWithPrepare
    }

    sliceCaseReducersByName[reducerName] = caseReducer
    sliceCaseReducersByType[type] = caseReducer
    actionCreators[reducerName] = prepareCallback
      ? createAction(type, prepareCallback)
      : createAction(type)
  })

  const finalCaseReducers = { ...extraReducers, ...sliceCaseReducersByType }
  const reducer = createReducer(
    initialState,
    finalCaseReducers as any,
    actionMatchers,
    defaultCaseReducer
  )

  return {
    name,
    reducer,
    actions: actionCreators as any,
    caseReducers: sliceCaseReducersByName as any,
  }
}
