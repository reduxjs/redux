// @flow
import { combineReducers as combineSeducers } from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'

const todoApp = combineSeducers({
  todos,
  visibilityFilter
})

export default todoApp
