// @flow

export type Id = number;

export type Text = string;

export type Todo = {
  +id: Id,
  +text: Text,
  +completed: boolean
};

export type Todos = Array<Todo>;

export type TodosState = {
  +todos: Todos
};

export type TodosAction =
  | { type: 'ADD_TODO', +id: Id, +text: Text }
  | { type: 'TOGGLE_TODO', +id: Id };
