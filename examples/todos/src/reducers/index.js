import { combineReducers } from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'

let rootReducer;
export default rootReducer = combineReducers({
  todos,
  visibilityFilter
})

