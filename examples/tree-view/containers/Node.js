import React from 'react'
import { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'

class Node extends Component {
  constructor(props) {
    super(props)
    this.handleIncrementClick = this.handleIncrementClick.bind(this)
    this.handleAddChildClick = this.handleAddChildClick.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
  }

  handleIncrementClick() {
    const { increment, id } = this.props
    increment(id)
  }

  handleAddChildClick(e) {
    e.preventDefault()

    const { addChild, createNode, id } = this.props
    const childId = createNode().nodeId
    addChild(id, childId)
  }

  handleRemoveClick(e) {
    e.preventDefault()

    const { removeNode, id } = this.props
    removeNode(id)
  }

  renderChild(childId) {
    return (
      <li key={childId}>
        <ConnectedNode id={childId} />
      </li>
    )
  }

  render() {
    const { counter, childIds, id } = this.props
    return (
      <div title={id}>
        Counter: {counter}
        {' '}
        <button onClick={this.handleIncrementClick}>
          +
        </button>
        {' '}
        <a href='#' onClick={this.handleRemoveClick}>
          Remove
        </a>
        <ul>
          {childIds.map(this.renderChild)}
          <li key='add'>
            <a href='#' onClick={this.handleAddChildClick}>
              Add child
            </a>
          </li>
        </ul>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return state[ownProps.id]
}

const ConnectedNode = connect(mapStateToProps, actions)(Node)
export default ConnectedNode
