import * as types from './types'

const initialState = []

export default function todos(state = initialState, action) {
  switch (action.type) {
    case types.FETCH_TODOS.SUCCESS:
      return [...action.todos]
    case types.ADD_TODO.SUCCESS:
      return [...state, action.todo]
    case types.DELETE_TODO.SUCCESS:
      return state.filter(todo => todo.id !== action.id)
    case types.EDIT_TODO.SUCCESS:
      return state.map(
        todo => (todo.id === action.todo.id ? {...todo, ...action.todo} : todo),
      )
    default:
      return state
  }
}
