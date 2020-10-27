import { configureStore } from '@reduxjs/toolkit'
import rootReducer from '../reducers'
import Devtools from '../containers/DevTools'
import hasDevtoolsExtension from './hasDevtoolsExtension'

const makeStore = preloadedState => {
  const enhancers = []

  // if we already have the redux-devtools browser extension,
  // we will not render the in-browser version.
  if (!hasDevtoolsExtension) {
    enhancers.push(Devtools.instrument())
  }

  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    enhancers
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
