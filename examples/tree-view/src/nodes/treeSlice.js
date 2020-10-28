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
    addChildToNode: {
      reducer: (state, action) => {
        // create Node
        const { nextId, id } = action.payload
        state[nextId] = { id: nextId, counter: 0, childIds: [] }

        // add child
        state[id].childIds.push(nextId)
      },
      prepare: id => {
        nextId++
        return { payload: { id, nextId: 'node_' + nextId } }
      }
    },
    removeNodeByParent(state, action) {
      const { childId, parentId } = action.payload
      const filteredChildIds = state[parentId].childIds.filter(
        id => id !== childId
      )
      // remove child
      state[parentId].childIds = filteredChildIds

      // delete Node(s)
      const ids = getAllDescendantIds(state, childId)

      deleteMany(state, ids)
    }
  }
})

export const {
  addChildToNode,
  removeNodeByParent,
  increment
} = treeSlice.actions

export default treeSlice.reducer
