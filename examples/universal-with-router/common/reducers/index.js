import { combineReducers } from 'redux'
import counter from './counter'
import { routeReducer } from 'react-router-redux'

const rootReducer = combineReducers({
  routing: routeReducer,
  counter
})

export default rootReducer
