import { createStore } from 'redux'
import reducer from '../reducers'

export default function configureStore(preloadedState) {
  const store = createStore(reducer, preloadedState)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
