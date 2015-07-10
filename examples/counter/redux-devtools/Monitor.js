import React, { PropTypes, findDOMNode } from 'react';
import Entry from './Entry';

export default class Monitor {
  static propTypes = {
    computedStates: PropTypes.array.isRequired,
    stagedActions: PropTypes.array.isRequired,
    skippedActions: PropTypes.object.isRequired,
    reset: PropTypes.func.isRequired,
    commit: PropTypes.func.isRequired,
    rollback: PropTypes.func.isRequired,
    sweep: PropTypes.func.isRequired,
    toggleAction: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired
  };

  static defaultProps = {
    select: (state) => state
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.stagedActions.length < nextProps.stagedActions.length) {
      const scrollableNode = findDOMNode(this).parentElement;
      const { scrollTop, offsetHeight, scrollHeight } = scrollableNode;

      this.scrollDown = Math.abs(
        scrollHeight - (scrollTop + offsetHeight)
      ) < 20;
    } else {
      this.scrollDown = false;
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.stagedActions.length < this.props.stagedActions.length &&
      this.scrollDown
    ) {
      const scrollableNode = findDOMNode(this).parentElement;
      const { scrollTop, offsetHeight, scrollHeight } = scrollableNode;

      scrollableNode.scrollTop = scrollHeight - offsetHeight;
      this.scrollDown = false;
    }
  }

  handleRollback() {
    this.props.rollback();
  }

  handleSweep() {
    this.props.sweep();
  }

  handleCommit() {
    this.props.commit();
  }

  handleToggleAction(index) {
    this.props.toggleAction(index);
  }

  handleReset() {
    this.props.reset();
  }

  render() {
    const elements = [];
    const { skippedActions, stagedActions, computedStates, select } = this.props;

    for (let i = 0; i < stagedActions.length; i++) {
      const action = stagedActions[i];
      const { state, error } = computedStates[i];

      elements.push(
        <Entry key={i}
               index={i}
               select={select}
               action={action}
               state={state}
               collapsed={skippedActions[i]}
               error={error}
               onActionClick={::this.handleToggleAction} />
      );
    }

    return (
      <div style={{
        fontFamily: 'Consolas, monospace',
        position: 'relative'
      }}>
        <div>
          <a onClick={::this.handleReset}
             style={{ textDecoration: 'underline', cursor: 'hand' }}>
            Reset
          </a>
        </div>
        {elements}
        <div>
          {computedStates.length > 1 &&
            <a onClick={::this.handleRollback}
               style={{ textDecoration: 'underline', cursor: 'hand' }}>
              Rollback
            </a>
          }
          {Object.keys(skippedActions).some(key => skippedActions[key]) &&
            <span>
              {' • '}
              <a onClick={::this.handleSweep}
                 style={{ textDecoration: 'underline', cursor: 'hand' }}>
                Sweep
              </a>
            </span>
          }
          {computedStates.length > 1 &&
            <span>
              <span>
              {' • '}
              </span>
              <a onClick={::this.handleCommit}
                 style={{ textDecoration: 'underline', cursor: 'hand' }}>
                Commit
              </a>
            </span>
          }
        </div>
      </div>
    );
  }
}
