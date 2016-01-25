export const INCREMENT = 'INCREMENT'
export const CREATE_NODE = 'CREATE_NODE'
export const ADD_CHILD = 'ADD_CHILD'
export const REMOVE_NODE = 'REMOVE_NODE'

export function increment(nodeId) {
  return {
    type: INCREMENT,
    nodeId
  }
}

let nextId = 0
export function createNode() {
  return {
    type: CREATE_NODE,
    nodeId: `new_${nextId++}`
  }
}

export function addChild(nodeId, childId) {
  return {
    type: ADD_CHILD,
    nodeId,
    childId
  }
}

export function removeNode(nodeId) {
  return {
    type: REMOVE_NODE,
    nodeId
  }
}
