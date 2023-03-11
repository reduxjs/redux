createReducer(initialState, {
  [todoAdded1a]: (state: SliceState, action: PayloadAction<string>) => {
    // stuff
  },
  [todoAdded1b]: someFunc,
  todoAdded1c: adapter.someFunc,
});

createReducer(initialState, {
  [todoAdded](state: SliceState, action: PayloadAction<string>) {
    // stuff
  },
});
