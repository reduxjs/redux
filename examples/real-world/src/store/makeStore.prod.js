import api from '../middleware/api'
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from '../reducers'

const makeStore = preloadedState =>
  configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api),
    preloadedState
  })

export default makeStore
