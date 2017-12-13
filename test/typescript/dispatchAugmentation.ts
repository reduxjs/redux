import { Dispatch, Action, AnyAction } from 'redux'

type ThunkAction<S = any, R = {}, D = AnyAction> = (
  dispatch: Dispatch<D>,
  getState: () => S
) => R

/**
 * Dispatch supports adding extra signatures via module augmentation.
 */
declare module 'redux' {
  interface Dispatch<D> {
    <R>(thunk: ThunkAction<any, R, D>): R
  }
}

declare const dispatch: Dispatch

type State = {
  field: 'a'
}

// Dispatch still has its default signature.
// typings:expect-error
dispatch('string')

const a = dispatch({ type: 'INCREMENT', count: 10 })
a.count
// typings:expect-error
a.wrongField

const thunk: ThunkAction<State, { field: 'f' }> = (dispatch, getState) => {
  setTimeout(() => {
    const state = getState()
    state.field
    // typings:expect-error
    state.wrongField

    dispatch({ type: 'INCREMENT' })
  }, 1000)
  return { field: 'f' }
}

const res = dispatch(thunk)
res.field
// typings:expect-error
res.wrongField

dispatch(dispatch => {
  // Injected dispatch also has extra signature.
  dispatch(thunk)
})
