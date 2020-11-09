import { combineReducers } from 'redux'
import { destinationsDataReducer } from './destinations'
import type { DestinationsState } from './destinations'

export type RootState = {
  destinations: DestinationsState
}

export const rootReducer = combineReducers({
  destinations: destinationsDataReducer
})
