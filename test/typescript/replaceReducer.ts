import { combineReducers, createStore } from '../..'

/**
 * verify that replaceReducer maintains strict typing if the new types change
 */
const bar = (state = { value: 'bar' }) => state
const baz = (state = { value: 'baz' }) => state
const ACTION = {
  type: 'action'
}

const originalCompositeReducer = combineReducers({ bar })
const store = createStore(originalCompositeReducer)
store.dispatch(ACTION)

const firstState = store.getState()
firstState.bar.value
// typings:expect-error
firstState.baz.value

const nextStore = store.replaceReducer(combineReducers({ baz })) // returns ->  { baz: { value: 'baz' }}

const nextState = nextStore.getState()
// typings:expect-error
nextState.bar.value
nextState.baz.value
