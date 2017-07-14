import { Todos, ITodo, Id, Text } from '../types/todos';
import { Action } from '../types';

const createTodo = (id: Id, text: Text): ITodo => ({
  id,
  text,
  completed: false
});

const toggleTodo = (todosList: Todos, id: Id): Todos =>
  todosList.map(t => (t.id !== id ? t : { ...t, completed: !t.completed }));

const todos = (state: Todos = [], action: Action): Todos => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, createTodo(action.id, action.text)];
    case 'TOGGLE_TODO':
      return toggleTodo(state, action.id);
    default:
      return state;
  }
};

export default todos;
