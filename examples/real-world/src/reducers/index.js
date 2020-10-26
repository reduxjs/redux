import paginate from './paginate'
import { combineReducers } from 'redux'
import errorMessageSlice from './errorMessage.slice'
import entitiesSlice from './entities.slice'
import { loadStargazers, loadStarred } from '../actions'

// Updates the pagination data for different actions.
const pagination = combineReducers({
  starredByUser: paginate({
    mapActionToKey: action => action.meta.arg.login,
    asyncThunk: loadStarred
  }),
  stargazersByRepo: paginate({
    mapActionToKey: action => action.meta.arg.fullName,
    asyncThunk: loadStargazers
  })
})

const rootReducer = combineReducers({
  entities: entitiesSlice.reducer,
  pagination,
  errorMessage: errorMessageSlice.reducer
})

export default rootReducer
