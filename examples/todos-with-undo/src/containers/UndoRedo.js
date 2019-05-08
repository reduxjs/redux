import React from 'react'
import { ActionCreators } from 'redux-undo';
import { connect } from 'react-redux'

let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }) => (
  <p>
    <button onClick={onUndo} disabled={!canUndo}>
      Undo
    </button>
    <button onClick={onRedo} disabled={!canRedo}>
      Redo
    </button>
  </p>
)
const mapStateToProps = (state) => ({
    canUndo: state.todos.present.length > 0,
    canRedo: state.todos.history.length > 0
})


const mapDispatchToProps = ({
  onUndo: ActionCreators.undo,
  onRedo: ActionCreators.redo
})
UndoRedo = connect(
  mapStateToProps,
  mapDispatchToProps
)(UndoRedo)

export default UndoRedo
