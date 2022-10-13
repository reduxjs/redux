const slice1 = createSlice({
  name: "a",
  initialState,

  extraReducers: (builder) => {
    builder.addCase(todoAdded, (state: SliceState, action: PayloadAction<string>) => {
      // stuff
    });
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
