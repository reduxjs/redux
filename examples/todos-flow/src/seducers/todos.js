// @flow
import type { Todos, Todo, Id, Text, Action } from '../types'

function createTodo(id: Id, text: Text): Todo {
  return {
    id,
    text,
    completed: false
  }
}

function toggleTodo(todos: Todos, id: Id): Todos {
  return todos.map(t => {
    if (t.id !== id) {
      return t
    }
    return Object.assign({}, t, {
      completed: !t.completed
    })
  })
}

const todos = (state: Todos = [], action: Action): Todos => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        createTodo(action.id, action.text)
      ]
    case 'TOGGLE_TODO':
      return toggleTodo(state, action.id)
    default:
      return state
  }
}

export default todos
