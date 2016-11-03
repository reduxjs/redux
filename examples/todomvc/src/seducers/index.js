import { combineReducers as combineSeducers } from 'redux'
import todos from './todos'

const rootSeducer = combineSeducers({
  todos
})

export default rootSeducer
