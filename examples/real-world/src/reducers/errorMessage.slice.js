const { createSlice } = require('@reduxjs/toolkit')

const errorMessageSlice = createSlice({
  name: 'errorMessageSlice',
  initialState: null,
  reducers: {
    reset: state => {
      state = null
    },
    setErrorMessage: (state, action) => {
      state = action.payload.error
    }
  }
})

export default errorMessageSlice