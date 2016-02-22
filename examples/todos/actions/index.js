import { createStore } from 'redux'
import todoApp from '../reducers'

export const store = createStore(todoApp)

let nextTodoId = 0

export class Actions {
  constructor(store) {
    this._store = store
  }

  addTodo(text) {
    store.dispatch({
      type: 'ADD_TODO',
      id: nextTodoId++,
      text
    })
  }

  setVisibilityFilter(filter) {
    store.dispatch({
      type: 'SET_VISIBILITY_FILTER',
      filter
    })
  }

  toggleTodo(id) {
    store.dispatch({
      type: 'TOGGLE_TODO',
      id
    })
  }
}

export const actions = new Actions(store)

export const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

export const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
}

export const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  }
}
