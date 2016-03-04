import { store } from '../reducers'
import autobind from 'autobind-decorator'

@autobind
class Todos {
  constructor(store) {
    this._store = store
  }

  visibleOnes() {
    const state = this._store.getState()
    const todos = state.todos

    switch (state.visibilityFilter) {
      case 'SHOW_ALL':
        return todos
      case 'SHOW_COMPLETED':
        return todos.filter(t => t.completed)
      case 'SHOW_ACTIVE':
        return todos.filter(t => !t.completed)
    }
  }
}

export const todos = new Todos(store)

