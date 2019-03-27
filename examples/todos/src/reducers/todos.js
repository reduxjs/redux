const todos = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ];
    case "DELETE_TODO":
      return state.filter(todo => todo.id !== action.id);

    case "EDIT_TODO":
      return state.map(todo =>
        todo.id === action.id
          ? { ...todo, text: action.text, progressEdit: undefined }
          : todo
      );
    case "DUPLICATE_TODO":
      return state

      
    case "TOGGLE_TODO":
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case "OPEN_EDIT_FORM":
      return state.map(todo =>
        todo.id === action.id ? { ...todo, progressEdit: true } : todo
      );
    default:
      return state;
  }
};

export default todos;
