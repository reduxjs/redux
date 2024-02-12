import type { Dispatch, Middleware } from 'redux'

export const thunk: Middleware<{
  <R>(thunk: (dispatch: Dispatch, getState: () => any) => R): R
}> =
  ({ dispatch, getState }) =>
  next =>
  action =>
    typeof action === 'function' ? action(dispatch, getState) : next(action)
