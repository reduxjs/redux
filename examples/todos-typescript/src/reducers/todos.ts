import { TodoActions } from "../actions";
import { exhaustiveCheck } from "../utils";

export interface TodoItem {
  id: number;
  completed: boolean;
  text: string;
}

export type TodosState = TodoItem[];

const todos = (state: TodosState = [], action: TodoActions): TodosState => {
  switch (action.type) {
    case "ADD_TODO":
      return [
        ...state,
        {
          completed: false,
          id: action.id,
          text: action.text
        }
      ];
    case "TOGGLE_TODO":
      return state.map(
        todo =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    default:
      exhaustiveCheck(action);
      return state;
  }
};

export default todos;
