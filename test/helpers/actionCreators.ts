import {
  ADD_TODO,
  DISPATCH_IN_MIDDLE,
  GET_STATE_IN_MIDDLE,
  SUBSCRIBE_IN_MIDDLE,
  UNSUBSCRIBE_IN_MIDDLE,
  THROW_ERROR,
  UNKNOWN_ACTION
} from './actionTypes'
import type { TodoAction } from './reducers'
import type { Dispatch } from 'redux'

export function addTodo(text: string): TodoAction {
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

export function dispatchInMiddle(boundDispatchFn: () => void) {
  return {
    type: DISPATCH_IN_MIDDLE,
    boundDispatchFn
  } as const
}

export function getStateInMiddle(boundGetStateFn: () => void) {
  return {
    type: GET_STATE_IN_MIDDLE,
    boundGetStateFn
  } as const
}

export function subscribeInMiddle(boundSubscribeFn: () => void) {
  return {
    type: SUBSCRIBE_IN_MIDDLE,
    boundSubscribeFn
  } as const
}

export function unsubscribeInMiddle(boundUnsubscribeFn: () => void) {
  return {
    type: UNSUBSCRIBE_IN_MIDDLE,
    boundUnsubscribeFn
  } as const
}

export function throwError() {
  return {
    type: THROW_ERROR
  } as const
}

export function unknownAction() {
  return {
    type: UNKNOWN_ACTION
  } as const
}
