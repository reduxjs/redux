import createNextState, { isDraft } from 'immer'
import type { EntityState, PreventAny } from './models'
import type { PayloadAction } from '../createAction'
import { isFSA } from '../createAction'
import { IsAny } from '../tsHelpers'

export function createSingleArgumentStateOperator<V>(
  mutator: (state: EntityState<V>) => void
) {
  const operator = createStateOperator((_: undefined, state: EntityState<V>) =>
    mutator(state)
  )

  return function operation<S extends EntityState<V>>(
    state: PreventAny<S, V>
  ): S {
    return operator(state as S, undefined)
  }
}

export function createStateOperator<V, R>(
  mutator: (arg: R, state: EntityState<V>) => void
) {
  return function operation<S extends EntityState<V>>(
    state: S,
    arg: R | PayloadAction<R>
  ): S {
    function isPayloadActionArgument(
      arg: R | PayloadAction<R>
    ): arg is PayloadAction<R> {
      return isFSA(arg)
    }

    const runMutator = (draft: EntityState<V>) => {
      if (isPayloadActionArgument(arg)) {
        mutator(arg.payload, draft)
      } else {
        mutator(arg, draft)
      }
    }

    if (isDraft(state)) {
      // we must already be inside a `createNextState` call, likely because
      // this is being wrapped in `createReducer` or `createSlice`.
      // It's safe to just pass the draft to the mutator.
      runMutator(state)

      // since it's a draft, we'll just return it
      return state
    } else {
      // @ts-ignore createNextState() produces an Immutable<Draft<S>> rather
      // than an Immutable<S>, and TypeScript cannot find out how to reconcile
      // these two types.
      return createNextState(state, runMutator)
    }
  }
}
