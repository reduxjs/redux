import { ADD_TODO, DISPATCH_IN_MIDDLE, THROW_ERROR, UNKNOWN_ACTION } from './actionTypes'

export function addTodo(text) {
  return { type: ADD_TODO, text }
}

export function addTodoAsync(text) {
  return dispatch => new Promise(resolve => setImmediate(() => {
    dispatch(addTodo(text))
    resolve()
  }))
}

export function addTodoIfEmpty(text) {
  return (dispatch, getState) => {
    if (!getState().length) {
      dispatch(addTodo(text))
    }
  }
}

export function dispatchInMiddle(boundDispatchFn) {
  return {
    type: DISPATCH_IN_MIDDLE,
    boundDispatchFn
  }
}

export function throwError() {
  return {
    type: THROW_ERROR
  }
}

export function unknownAction() {
  return {
    type: UNKNOWN_ACTION
  }
}
