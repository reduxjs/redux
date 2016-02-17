import {createStore, Action} from '../../index.d.ts'

interface AddTodoAction extends Action {
  text: string;
}

function todos(state: string[] = [], action: Action): string[] {
  switch (action.type) {
    case 'ADD_TODO':
      const addTodoAction = <AddTodoAction>action;
      return state.concat([addTodoAction.text]);
    default:
      return state
  }
}

let store = createStore(todos, ['Use Redux']);

store.dispatch({
  type: 'ADD_TODO',
  text: 'Read the docs'
})
