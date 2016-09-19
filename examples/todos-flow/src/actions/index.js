// @flow
import type { Id, Text, VisibilityFilter, Action } from '../types'

let nextTodoId: Id = 0

export const addTodo = (text: Text): Action => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

export const setVisibilityFilter = (filter: VisibilityFilter): Action => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
}

export const toggleTodo = (id: Id): Action => {
  return {
    type: 'TOGGLE_TODO',
    id
  }
}
