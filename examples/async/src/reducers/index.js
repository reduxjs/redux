import { combineReducers } from 'redux'

function selectedReddit(state = 'reactjs', action) {
  switch (action.type) {
    case 'SELECT_REDDIT':
      return action.reddit
    default:
      return state
  }
}

function posts(state = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action) {
  switch (action.type) {
    case 'INVALIDATE_REDDIT':
      return {
        ...state,
        didInvalidate: true
      }
    case 'REQUEST_POSTS':
      return {
        ...state,
        isFetching: true,
        didInvalidate: false
      }
    case 'RECEIVE_POSTS':
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      }
    default:
      return state
  }
}

function postsByReddit(state = { }, action) {
  switch (action.type) {
    case 'INVALIDATE_REDDIT':
    case 'RECEIVE_POSTS':
    case 'REQUEST_POSTS':
      return {
        ...state,
        [action.reddit]: posts(state[action.reddit], action)
      }
    default:
      return state
  }
}

const reducer = combineReducers({
  postsByReddit,
  selectedReddit
})

export default reducer
