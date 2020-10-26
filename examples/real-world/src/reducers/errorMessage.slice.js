const { createSlice } = require('@reduxjs/toolkit')

const errorMessageSlice = createSlice({
  name: 'errorMessageSlice',
  initialState: {
    message: null
  },
  reducers: {
    reset: state => {
      state.message = null
    }
  },
  extraReducers: builder =>
    builder.addMatcher(
      action => action.error,
      (state, action) => {
        state.message = action.payload.message || 'Something bad happened'
      }
    )
})

export default errorMessageSlice
