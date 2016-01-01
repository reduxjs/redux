import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import api from '../middleware/api'
import rootReducer from '../reducers'

const finalCreateStore = compose(
  applyMiddleware(thunk, api)
)(createStore)

export default function configureStore(initialState) {
  return finalCreateStore(rootReducer, initialState)
}