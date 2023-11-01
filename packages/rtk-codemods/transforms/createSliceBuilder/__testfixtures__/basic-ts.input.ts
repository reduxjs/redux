const slice1 = createSlice({
  name: "a",
  initialState,
  extraReducers: {
    [todoAdded1a]: (state: SliceState, action: PayloadAction<string>) => {
      // stuff
    },
    [todoAdded1b]: someFunc,
    todoAdded1c: adapter.someFunc,
  }
});

const slice2 = createSlice({
  name: "b",
  initialState,
  extraReducers: {
    [todoAdded](state: SliceState, action: PayloadAction<string>) {
      // stuff
    },
  }
});
