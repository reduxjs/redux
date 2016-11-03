import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import api from '../middleware/api'
import rootSeducer from '../seducers'

const configureStore = preloadedState => createStore(
  rootSeducer,
  preloadedState,
  applyMiddleware(thunk, api)
)

export default configureStore
