import { createSlice } from '@reduxjs/toolkit'

let nextId = 0

const getAllDescendantIds = (tree, id) => {
  const queue = [id, ...tree[id].childIds]
  const descendants = []
  let indexPointer = 0

  while (indexPointer < queue.length) {
    const currentItem = queue[indexPointer]
    descendants.push(currentItem)
    queue.push(...tree[currentItem].childIds)
    indexPointer++
  }

  return descendants
}

const deleteMany = (tree, ids) => {
  ids.forEach(id => delete tree[id])
}

const treeSlice = createSlice({
  name: 'tree',
  initialState: {},
  reducers: {
    increment(state, action) {
      const nodeId = action.payload
      state[nodeId].counter++
    },
    createNode: {
      reducer: (state, action) => {
        const nextId = action.payload
        state[nextId] = { id: nextId, counter: 0, childIds: [] }
      },
      prepare: () => {
        nextId++
        return { payload: 'node_' + nextId }
      }
    },
    addChild: {
      reducer: (state, action) => {
        const { nodeId, nextId } = action.payload
        const childId = nextId

        state[nodeId].childIds.push(childId)
      },
      prepare: nodeId => {
        return { payload: { nodeId, nextId: 'node_' + nextId } }
      }
    },
    removeChild(state, action) {
      const { childId, nodeId } = action.payload
      const filteredChildIds = state[nodeId].childIds.filter(
        id => id !== childId
      )
      state[nodeId].childIds = filteredChildIds
    },
    deleteNode(state, action) {
      const nodeId = action.payload
      const ids = getAllDescendantIds(state, nodeId)

      deleteMany(state, ids)
    }
  }
})

export const {
  addChild,
  addChildToNode,
  createNode,
  removeNodeByParent,
  deleteNode,
  removeChild,
  increment
} = treeSlice.actions

export default treeSlice.reducer
