import { combineReducers as combineSeducers } from 'redux'
import counter from './counter'

const rootSeducer = combineSeducers({
  counter
})

export default rootSeducer
