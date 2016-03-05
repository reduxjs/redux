import * as ActionTypes from '../constants/ActionTypes'

export const addTodo = (text) => {
  return {
    type: ActionTypes.ADD_TODO,
    text
  }
}

export const setVisibilityFilter = (filter) => {
  return {
    type: ActionTypes.SET_VISIBILITY_FILTER,
    filter
  }
}

export const deleteTodo = (id) => {
  return {
    type: ActionTypes.DELETE_TODO,
    id
  }
}

export const editTodo = (id, text) => {
  return { 
    type: ActionTypes.EDIT_TODO, 
    id, 
    text 
  }
}

export const completeTodo = (id) => {
  return { 
    type: ActionTypes.COMPLETE_TODO, 
    id 
  }
}

export const clearCompleted = () => {
  return {
    type: ActionTypes.CLEAR_COMPLETED
  }
}

export const completeAll = () => {
  return { 
    type: ActionTypes.COMPLETE_ALL 
  }
}

