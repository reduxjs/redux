import { INCREMENT, ADD_CHILD, CREATE_NODE } from '../actions'

function node(state, action) {
  switch (action.type) {
    case CREATE_NODE:
      return {
        id: action.nodeId,
        counter: 0,
        childIds: []
      }
    case INCREMENT:
      return Object.assign({}, state, {
        counter: state.counter + 1
      })
    case ADD_CHILD:
      return Object.assign({}, state, {
        childIds: [ ...state.childIds, action.childId ]
      })
    default:
      return state
  }
}

export default function (state = {}, action) {
  const { nodeId } = action
  if (typeof nodeId === 'undefined') {
    return state
  }

  return Object.assign({}, state, {
    [nodeId]: node(state[nodeId], action)
  })
}

