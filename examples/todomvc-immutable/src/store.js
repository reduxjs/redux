import { createStore } from 'redux'
import Immutable from 'immutable'
import reducer from './reducers'

const initialState = Immutable.Map()

export default createStore(reducer, initialState)