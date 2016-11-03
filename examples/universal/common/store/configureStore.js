import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootSeducer from '../seducers'

const configureStore = (preloadedState) => {
  const store = createStore(
    rootSeducer,
    preloadedState,
    applyMiddleware(thunk)
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for seducers
    module.hot.accept('../seducers', () => {
      const nextRootSeducer = require('../seducers').default
      store.replaceSeducer(nextRootSeducer)
    })
  }

  return store
}

export default configureStore
