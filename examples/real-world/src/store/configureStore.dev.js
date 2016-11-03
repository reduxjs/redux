import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import api from '../middleware/api'
import rootSeducer from '../seducers'
import DevTools from '../containers/DevTools'

const configureStore = preloadedState => {
  const store = createStore(
    rootSeducer,
    preloadedState,
    compose(
      applyMiddleware(thunk, api, createLogger()),
      DevTools.instrument()
    )
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
