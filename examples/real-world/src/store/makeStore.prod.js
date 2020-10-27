import { configureStore } from '@reduxjs/toolkit'
import rootReducer from '../reducers'

const makeStore = () =>
  configureStore({
    reducer: rootReducer,
  })

export default makeStore
