import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import rootReducer from '../reducers'

const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger)
  })

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const newRootReducer = require('../reducers').default
      store.replaceReducer(newRootReducer)
    })
  }

  return store
}

export default makeStore
