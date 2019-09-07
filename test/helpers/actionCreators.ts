import {
  ADD_TODO,
  DISPATCH_IN_MIDDLE,
  GET_STATE_IN_MIDDLE,
  SUBSCRIBE_IN_MIDDLE,
  UNSUBSCRIBE_IN_MIDDLE,
  THROW_ERROR,
  UNKNOWN_ACTION
} from './actionTypes'
import { Action, AnyAction, Dispatch } from '../..'

export function addTodo(text: string): AnyAction {
  return { type: ADD_TODO, text }
}

export function addTodoAsync(text: string) {
  return (dispatch: Dispatch): Promise<void> =>
    new Promise(resolve =>
      setImmediate(() => {
        dispatch(addTodo(text))
        resolve()
      })
    )
}

export function addTodoIfEmpty(text: string) {
  return (dispatch: Dispatch, getState: () => any) => {
    if (!getState().length) {
      dispatch(addTodo(text))
    }
  }
}

export function dispatchInMiddle(boundDispatchFn: () => void): AnyAction {
  return {
    type: DISPATCH_IN_MIDDLE,
    boundDispatchFn
  }
}

export function getStateInMiddle(boundGetStateFn: () => void): AnyAction {
  return {
    type: GET_STATE_IN_MIDDLE,
    boundGetStateFn
  }
}

export function subscribeInMiddle(boundSubscribeFn: () => void): AnyAction {
  return {
    type: SUBSCRIBE_IN_MIDDLE,
    boundSubscribeFn
  }
}

export function unsubscribeInMiddle(boundUnsubscribeFn: () => void): AnyAction {
  return {
    type: UNSUBSCRIBE_IN_MIDDLE,
    boundUnsubscribeFn
  }
}

export function throwError(): Action {
  return {
    type: THROW_ERROR
  }
}

export function unknownAction(): Action {
  return {
    type: UNKNOWN_ACTION
  }
}
