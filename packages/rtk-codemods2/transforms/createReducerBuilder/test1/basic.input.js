createReducer(initialState, (builder) => {
  builder.addCase(todoAdded1a, (state, action) => {
    // stuff 1a
  });

  builder.addCase(todoAdded1b, (state, action) => action.payload);

  builder.addCase(todoAdded1c + 'test', (state, action) => {
    // stuff 1c
  });

  builder.addCase(todoAdded1d, (state, action) => {
    // stuff 1d
  });

  builder.addCase(todoAdded1e, (state, action) => {
    // stuff 1e
  });

  builder.addCase(todoAdded1f, (state, action) => {
    //stuff 1f
  });
});

createReducer(initialState, (builder) => {
  builder.addCase(todoAdded2a, (state, action) => {
    // stuff 2a
  });

  builder.addCase(todoAdded2b, (state, action) => {
    // stuff 2b
  });

  builder.addCase(todoAdded2c, (state, action) => {
    // stuff 2c
  });
});
