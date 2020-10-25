import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addChild,
  createNode,
  deleteNode,
  removeChild,
  increment
} from './treeSlice'

const Node = React.memo(({ id, parentId }) => {
  const node = useSelector(state => state.tree[id])
  const dispatch = useDispatch()

  const { childIds, counter } = node

  const handleIncrementClick = () => {
    dispatch(increment(id))
  }

  const handleAddChildClick = () => {
    dispatch(createNode())
    dispatch(addChild(id))
  }

  const handleRemoveClick = () => {
    dispatch(removeChild({ nodeId: parentId, childId: id }))
    dispatch(deleteNode(id))
  }

  const renderChild = ({ childId, id }) => {
    return (
      <li key={childId}>
        <Node id={childId} parentId={id} />
      </li>
    )
  }

  return (
    <div>
      Counter: {counter} <button onClick={handleIncrementClick}>+</button>{' '}
      {typeof parentId !== 'undefined' && (
        <a
          href="#"
          onClick={handleRemoveClick} // eslint-disable-line jsx-a11y/anchor-is-valid
          style={{ color: 'lightgray', textDecoration: 'none' }}
        >
          ×
        </a>
      )}
      <ul>
        {childIds.map(childId => renderChild({ childId, id }))}
        <li key="add">
          <a
            href="#" // eslint-disable-line jsx-a11y/anchor-is-valid
            onClick={handleAddChildClick}
          >
            Add child
          </a>
        </li>
      </ul>
    </div>
  )
})

export default Node
