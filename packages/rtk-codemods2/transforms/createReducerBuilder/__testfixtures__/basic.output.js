createReducer(initialState, (builder) => {
  builder.addCase(todoAdded, (state, action) => {
    // stuff
  });
});

createReducer(initialState, (builder) => {
  builder.addCase(todoAdded, function(state, action) {
    // stuff
  });
});
