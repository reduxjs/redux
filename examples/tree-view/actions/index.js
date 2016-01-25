export const INCREMENT = 'INCREMENT'
export const CREATE_NODE = 'CREATE_NODE'
export const ADD_CHILD = 'ADD_CHILD'

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
