import {combineReducers} from 'redux'
import todos from './todos/reducer'

const rootReducer = combineReducers({
  todos,
})

export default rootReducer
