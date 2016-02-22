import { store } from './index'

class Todos {
  constructor(store) {
    this._store = store
  }

  visibleOnes() {
    let todos = this._store.todos
    if(!todos) {
      todos = []
    }
    switch (this._store.visibilityFilter) {
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

