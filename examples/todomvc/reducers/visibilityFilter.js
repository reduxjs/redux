import * as ActionTypes from '../constants/ActionTypes'
import * as TodoFilters from '../constants/TodoFilters'

const visibilityFilter = (state = TodoFilters.SHOW_ALL, action) => {
  switch (action.type) {
    case ActionTypes.SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}

export default visibilityFilter
