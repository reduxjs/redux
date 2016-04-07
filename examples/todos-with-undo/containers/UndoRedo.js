import React, { PropTypes } from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { connect } from 'react-redux';

let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }) => (
  <p>
    <button onClick={onUndo} disabled={!canUndo}>
      Undo
    </button>
    <button onClick={onRedo} disabled={!canRedo}>
      Redo
    </button>
  </p>
);

UndoRedo.propTypes = {
  canUndo: PropTypes.bool,
  canRedo: PropTypes.bool,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
};

const mapStateToProps = (state) => (
  {
    canUndo: state.todos.past.length > 0,
    canRedo: state.todos.future.length > 0,
  }
);

const mapDispatchToProps = (dispatch) => (
  {
    onUndo: () => dispatch(UndoActionCreators.undo()),
    onRedo: () => dispatch(UndoActionCreators.redo()),
  }
);

UndoRedo = connect(
  mapStateToProps,
  mapDispatchToProps
)(UndoRedo);

export default UndoRedo;
