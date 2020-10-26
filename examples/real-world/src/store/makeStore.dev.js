import { configureStore } from '@reduxjs/toolkit'
import rootReducer from '../reducers'

const makeStore = preloadedState => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
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
