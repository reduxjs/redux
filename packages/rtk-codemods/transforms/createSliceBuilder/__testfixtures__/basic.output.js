const slice1 = createSlice({
  name: "a",
  initialState: {},

  extraReducers: (builder) => {
    builder.addCase(todoAdded1a, (state, action) => {
      // stuff
    });

    builder.addCase(todoAdded1b, (state, action) => action.payload);

    builder.addCase(todoAdded1c + "test", (state, action) => {
      // stuff
    });

    builder.addCase(todoAdded1d, (state, action) => {
      // stuff
    });

    builder.addCase(todoAdded1e, (state, action) => {
      // stuff
    });

    builder.addCase(todoAdded1f, (state, action) => {
      //stuff
    });

    builder.addCase(todoAdded1g, someFunc);
    builder.addCase(todoAdded1h, adapter.someFunc);
  }
});


const slice2 = createSlice({
  name: "b",
  initialState: {},

  extraReducers: (builder) => {
    builder.addCase(todoAdded2a, (state, action) => {
      // stuff
    });

    builder.addCase(todoAdded2b, (state, action) => {
      // stuff
    });

    builder.addCase(todoAdded2c, (state, action) => {
      // stuff
    });
  }
});