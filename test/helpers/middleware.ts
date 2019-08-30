import { ThunkDispatch } from 'redux-thunk'

import { rootActions } from './actionTypes'
import { Middleware } from '../..'

export const thunk: Middleware<
  ThunkDispatch<any, {}, rootActions>,
  any,
  ThunkDispatch<any, {}, rootActions>
> = ({ dispatch, getState }) => {
  return next => action =>
    typeof action === 'function' ? action(dispatch, getState) : next(action)
}
