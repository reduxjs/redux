let nextTodoId = 0;
export const addTodo = text => ({
  type: "ADD_TODO",
  id: nextTodoId++,
  text
});
export const deleteTodo = id => ({
  type: "DELETE_TODO",
  id: id
});
export const duplicateTodo = (id, text) => ({
  type: "DUPLICATE_TODO",
  id,
  text
});
export const openEditForm = id => ({
  type: "OPEN_EDIT_FORM",
  id
});
export const editTodo = (id, text) => ({
  type: "EDIT_TODO",
  id,
  text
});

export const setVisibilityFilter = filter => ({
  type: "SET_VISIBILITY_FILTER",
  filter
});

export const toggleTodo = id => ({
  type: "TOGGLE_TODO",
  id
});

export const VisibilityFilters = {
  SHOW_ALL: "SHOW_ALL",
  SHOW_COMPLETED: "SHOW_COMPLETED",
  SHOW_ACTIVE: "SHOW_ACTIVE"
};
