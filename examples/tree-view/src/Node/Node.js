import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addChild,
  createNode,
  deleteNode,
  removeChild,
  increment,
} from "./treeSlice";

const Node = React.memo(({ id, parentId }) => {
  const node = useSelector((state) => state.tree[id]);
  const dispatch = useDispatch();

  const { childIds, counter } = node;

  const handleIncrementClick = () => {
    dispatch(increment(id));
  };

  const handleAddChildClick = () => {
    dispatch(createNode());
    dispatch(addChild(id));
  };

  const handleRemoveClick = () => {
    dispatch(removeChild({ nodeId: parentId, childId: id }));
    dispatch(deleteNode(id));
  };

  const renderChild = (childId, id) => {
    return (
      <li key={childId}>
        <Node id={childId} parentId={id} />
      </li>
    );
  };

  return (
    <div className="node">
      Counter: {counter}{" "}
      <button className="btn btn-counter" onClick={handleIncrementClick}>
        +
      </button>{" "}
      {typeof parentId !== "undefined" && (
        <button className="btn btn-remove" onClick={handleRemoveClick}>
          X
        </button>
      )}
      <ul className="node-children">
        {childIds.map((childId) => renderChild(childId, id))}
        <li key="add">
          <button className="btn btn-add-child" onClick={handleAddChildClick}>
            Add Child
          </button>
        </li>
      </ul>
    </div>
  );
});

export default Node;
