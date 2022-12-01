createReducer(initialState, (builder) => {
  builder.addCase(todoAdded1a, (state: SliceState, action: PayloadAction<string>) => {
    // stuff
  });

  builder.addCase(todoAdded1b, someFunc);
  builder.addCase(todoAdded1c, adapter.someFunc);
});

createReducer(initialState, (builder) => {
  builder.addCase(todoAdded, (state: SliceState, action: PayloadAction<string>) => {
    // stuff
  });
});
