import { ThunkAction } from 'redux-thunk'

import {
  ADD_TODO,
  AddTodo,
  DISPATCH_IN_MIDDLE,
  DispatchInMiddle,
  GET_STATE_IN_MIDDLE,
  GetStateInMiddle,
  SUBSCRIBE_IN_MIDDLE,
  SubscribeInMiddle,
  UNSUBSCRIBE_IN_MIDDLE,
  UnsubscribeInMiddle,
  THROW_ERROR,
  ThrowError,
  UNKNOWN_ACTION,
  UnknownAction
} from './actionTypes'

export function addTodo(text: string): AddTodo {
  return { type: ADD_TODO, text }
}

export function addTodoAsync(text: string): ThunkAction<any, any, {}, AddTodo> {
  return dispatch =>
    new Promise<void>(resolve =>
      setImmediate(() => {
        dispatch(addTodo(text))
        resolve()
      })
    )
}

export function addTodoIfEmpty(
  text: string
): ThunkAction<any, any, {}, AddTodo> {
  return (dispatch, getState) => {
    if (!getState().length) {
      dispatch(addTodo(text))
    }
  }
}

export function dispatchInMiddle(
  boundDispatchFn: () => void
): DispatchInMiddle {
  return {
    type: DISPATCH_IN_MIDDLE,
    boundDispatchFn
  }
}

export function getStateInMiddle(
  boundGetStateFn: () => void
): GetStateInMiddle {
  return {
    type: GET_STATE_IN_MIDDLE,
    boundGetStateFn
  }
}

export function subscribeInMiddle(
  boundSubscribeFn: () => void
): SubscribeInMiddle {
  return {
    type: SUBSCRIBE_IN_MIDDLE,
    boundSubscribeFn
  }
}

export function unsubscribeInMiddle(
  boundUnsubscribeFn: () => void
): UnsubscribeInMiddle {
  return {
    type: UNSUBSCRIBE_IN_MIDDLE,
    boundUnsubscribeFn
  }
}

export function throwError(): ThrowError {
  return {
    type: THROW_ERROR
  }
}

export function unknownAction(): UnknownAction {
  return {
    type: UNKNOWN_ACTION
  }
}
