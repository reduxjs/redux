import { MiddlewareAPI, Dispatch, AnyAction } from '../..'

type ThunkAction<T extends any = any> = T extends AnyAction
  ? AnyAction
  : T extends Function
  ? T
  : never

export function thunk({ dispatch, getState }: MiddlewareAPI) {
  return (next: Dispatch) => <T>(action: ThunkAction) =>
    typeof action === 'function' ? action(dispatch, getState) : next(action)
}
