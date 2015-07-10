import React, { PropTypes, findDOMNode } from 'react';
import { ActionTypes } from './devtools';
import { connect } from '../../../src/react';
import ReduxMonitorEntry from './ReduxMonitorEntry';
import identity from 'lodash/utility/identity';
import values from 'lodash/object/values';

@connect(state => ({
  stagedActions: state.stagedActions,
  computedStates: state.computedStates,
  skippedActions: state.skippedActions
}))
export default class ReduxMonitor {
  static propTypes = {
    computedStates: PropTypes.array.isRequired,
    select: PropTypes.func.isRequired
  };

  static defaultProps = {
    select: identity
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.computedStates.length < nextProps.computedStates.length) {
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
      prevProps.computedStates.length < this.props.computedStates.length &&
      this.scrollDown
    ) {
      const scrollableNode = findDOMNode(this).parentElement;
      const { scrollTop, offsetHeight, scrollHeight } = scrollableNode;

      scrollableNode.scrollTop = scrollHeight - offsetHeight;
      this.scrollDown = false;
    }
  }

  handleRollback() {
    this.props.dispatch({
      type: ActionTypes.ROLLBACK
    });
  }

  handleSweep() {
    this.props.dispatch({
      type: ActionTypes.SWEEP
    });
  }

  handleCommit() {
    this.props.dispatch({
      type: ActionTypes.COMMIT
    });
  }

  handleToggleAction(index) {
    this.props.dispatch({
      type: ActionTypes.TOGGLE_ACTION,
      index
    });
  }

  handleReset() {
    this.props.dispatch({
      type: ActionTypes.RESET
    });
  }

  render() {
    const elements = [];
    const { skippedActions, stagedActions, computedStates, select } = this.props;

    for (let i = 0; i < stagedActions.length; i++) {
      const action = stagedActions[i];
      const { state, error } = computedStates[i];

      elements.push(
        <ReduxMonitorEntry key={i}
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
          {values(skippedActions).some(identity) &&
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
