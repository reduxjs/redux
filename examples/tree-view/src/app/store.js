import { configureStore } from "@reduxjs/toolkit";
import treeReducer from "../Node/treeSlice";

export const store = configureStore({
  reducer: {
    tree: treeReducer,
  },
});
