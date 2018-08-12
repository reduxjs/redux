let nextTodoId = 0;

export type TodoActions =
  | {
      type: "ADD_TODO";
      id: number;
      text: string;
    }
  | { type: "TOGGLE_TODO"; id: number };

export type VisibilityFilters = "SHOW_ALL" | "SHOW_COMPLETED" | "SHOW_ACTIVE";

export type VisibilityActions = {
  type: "SET_VISIBILITY_FILTER";
  filter: VisibilityFilters;
};

export const addTodo = (text: string): TodoActions => ({
  type: "ADD_TODO",
  id: nextTodoId++,
  text
});

export const toggleTodo = (id: number): TodoActions => ({
  type: "TOGGLE_TODO",
  id
});

export const setVisibilityFilter = (
  filter: VisibilityFilters
): VisibilityActions => ({
  type: "SET_VISIBILITY_FILTER",
  filter
});
