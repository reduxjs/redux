import { combineReducers } from 'redux-immutable'

import todos from './todos'

const rootReducer = combineReducers({
  todos
})

export default rootReducer
