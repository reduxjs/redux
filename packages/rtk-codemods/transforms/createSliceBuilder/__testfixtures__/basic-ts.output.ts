const slice1 = createSlice({
  name: "a",
  initialState,

  extraReducers: (builder) => {
    builder.addCase(todoAdded1a, (state: SliceState, action: PayloadAction<string>) => {
      // stuff
    });

    builder.addCase(todoAdded1b, someFunc);
    builder.addCase(todoAdded1c, adapter.someFunc);
  }
});

const slice2 = createSlice({
  name: "b",
  initialState,

  extraReducers: (builder) => {
    builder.addCase(todoAdded, (state: SliceState, action: PayloadAction<string>) => {
      // stuff
    });
  }
});
