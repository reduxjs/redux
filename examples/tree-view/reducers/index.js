import { INCREMENT, ADD_CHILD, CREATE_NODE, REMOVE_NODE } from '../actions'

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

  if(action.type === REMOVE_NODE) {
    return Object.keys(state).reduce((accumulator, key) => {
      if(key !== nodeId) { // don't return anything for this key if it is the node being removed
        const node = state[key]
        const childIndex = node.childIds.indexOf(nodeId)
        if(childIndex < 0) {
          accumulator[key] = node  // return the unchanged node if the node removed is not a child
        } else {
          // node being removed is a child of this node, so copy the childIds array and remove it
          const childIdsWithoutNode = [...node.childIds] // copy childIds array
          childIdsWithoutNode.splice(childIndex, 1)      // mutable remove
          accumulator[key] =
            Object.assign({}, node, {childIds: childIdsWithoutNode}) // copy and replace childIds array
        }
      }
      return accumulator
    }, {})
  }
  return Object.assign({}, state, {
    [nodeId]: node(state[nodeId], action)
  })
}

