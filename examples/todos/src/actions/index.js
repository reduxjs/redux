import { store } from '../reducers'

let nextTodoId = 0

export default class Actions {
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
