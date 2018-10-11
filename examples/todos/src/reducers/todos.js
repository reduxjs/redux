// @flow

type ActionType = {
  type: string,
  id: number,
  text: string,
  completed: boolean
}

type Todo = {
  id: number,
  text: string,
  completed: boolean,
  createdTime: string
}

export type Todos = Array<Todo>;

const toggleTodo = (todos: Todos, id: number): Todos => {
  return todos.map(todo =>
    (todo.id === id)
      ? {...todo, completed: !todo.completed}
      : todo
  )
}

const todos = (state: Todos = [], action: ActionType) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false,
          createdTime: new Date().toLocaleString()
        }
      ]
    case 'TOGGLE_TODO':
      return toggleTodo(state, action.id)
    default:
      return state
  }
}

export default todos
