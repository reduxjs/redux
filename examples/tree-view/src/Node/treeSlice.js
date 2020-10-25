import { createSlice } from "@reduxjs/toolkit";
import generateTree from "../generateTree";

const { tree, idCount } = generateTree();

let nextId = idCount;
const initialState = tree;

const getAllDescendants = (tree, id) => {
  const descendants = [id];
  const run = (id) => {
    tree[id].childIds.forEach((childId) => {
      descendants.push(childId);
      run(childId);
    });
  };

  run(id);
  return descendants;
};

const deleteMany = (tree, ids) => {
  ids.forEach((id) => delete tree[id]);
};

const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    increment(state, action) {
      const nodeId = action.payload;
      state[nodeId].counter++;
    },
    createNode(state) {
      nextId++;
      state[nextId] = { id: nextId, counter: 0, childIds: [] };
    },
    deleteNode(state, action) {
      const nodeId = action.payload;
      const ids = getAllDescendants(state, nodeId);

      deleteMany(state, ids);
    },
    addChild(state, action) {
      const nodeId = action.payload;
      const childId = nextId;
      state[nodeId].childIds.push(childId);
      state[childId] = { id: childId, childIds: [], counter: 0 };
    },
    removeChild(state, action) {
      const { childId, nodeId } = action.payload;
      const filteredChildIds = state[nodeId].childIds.filter(
        (id) => id !== childId
      );
      state[nodeId].childIds = filteredChildIds;
    },
  },
});

export const {
  addChild,
  createNode,
  deleteNode,
  removeChild,
  increment,
} = treeSlice.actions;
export default treeSlice.reducer;
