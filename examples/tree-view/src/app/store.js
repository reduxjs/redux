import { configureStore } from '@reduxjs/toolkit'
import generateTree from '../generateTree'
import treeReducer from '../nodes/treeSlice'

export const store = configureStore({
  reducer: {
    tree: treeReducer
  },
  preloadedState: {
    tree: generateTree()
  }
})
