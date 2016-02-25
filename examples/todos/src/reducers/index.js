import { combineReducers } from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'
import { createStore } from 'redux'

const todoApp = combineReducers({
  todos,
  visibilityFilter
})

export const store = createStore(todoApp)
