import { ADD_TODO, DISPATCH_IN_MIDDLE, THROW_ERROR } from './actionTypes'


function id(state = []) {
  return state.reduce((result, item) => (
    item.id > result ? item.id : result
  ), 0) + 1
}

export function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [ 
        ...state, 
        {
          id: id(state),
          text: action.text
        }
      ]
    default:
      return state
  }
}

export function todosReverse(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        {
          id: id(state),
          text: action.text
        }, ...state
      ]
    default:
      return state
  }
}

export function dispatchInTheMiddleOfReducer(state = [], action) {
  switch (action.type) {
    case DISPATCH_IN_MIDDLE:
      action.boundDispatchFn()
      return state
    default:
      return state
  }
}

export function errorThrowingReducer(state = [], action) {
  switch (action.type) {
    case THROW_ERROR:
      throw new Error()
    default:
      return state
  }
}
