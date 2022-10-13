createReducer(initialState, {
  [todoAdded]: (state: SliceState, action: PayloadAction<string>) => {
    // stuff
  },
});

createReducer(initialState, {
  [todoAdded](state: SliceState, action: PayloadAction<string>) {
    // stuff
  },
});
