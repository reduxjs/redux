createReducer(initialState, (builder) => {
  builder.addCase(todoAdded, (state: SliceState, action: PayloadAction<string>) => {
    // stuff
  });
});

createReducer(initialState, (builder) => {
  builder.addCase(todoAdded, function(state: SliceState, action: PayloadAction<string>) {
    // stuff
  });
});
