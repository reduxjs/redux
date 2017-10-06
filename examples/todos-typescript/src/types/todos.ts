export type Id = number;

export type Text = string;

export interface ITodo {
  id: Id;
  text: Text;
  completed: boolean;
}

export type Todos = ITodo[];

export interface ITodosState {
  todos: Todos;
}

export type TodosAction =
  | { type: 'ADD_TODO', id: Id, text: Text }
  | { type: 'TOGGLE_TODO', id: Id };
