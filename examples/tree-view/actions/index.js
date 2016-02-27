export const INCREMENT = 'INCREMENT'
export const CREATE_NODE = 'CREATE_NODE'
export const DELETE_NODE = 'DELETE_NODE'
export const ADD_CHILD = 'ADD_CHILD'
export const REMOVE_CHILD = 'REMOVE_CHILD'

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

export function deleteNode(nodeId) {
  return {
    type: DELETE_NODE,
    nodeId
  }
}

export function addChild(nodeId, childId) {
  return {
    type: ADD_CHILD,
    nodeId,
    childId
  }
}

export function removeChild(nodeId, childId) {
  return {
    type: REMOVE_CHILD,
    nodeId,
    childId
  }
}
