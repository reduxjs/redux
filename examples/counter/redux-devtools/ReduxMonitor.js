import React, { PropTypes, findDOMNode } from 'react';
import { ActionTypes } from './devtools';
import { connect } from '../../../src/react';
import ReduxMonitorEntry from './ReduxMonitorEntry';
import identity from 'lodash/utility/identity';
import values from 'lodash/object/values';

@connect(state => ({
  log: state.log || [], // TODO
  disabledActions: state.disabledActions || {}, // TODO
  error: state.error || null // TODO
}))
export default class ReduxMonitor {
  static propTypes = {
    log: PropTypes.array.isRequired,
    select: PropTypes.func.isRequired
  };

  static defaultProps = {
    select: identity
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.log.length < nextProps.log.length) {
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
      prevProps.log.length < this.props.log.length &&
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

  handleToggleAction(index, toggleMany) {
    this.props.dispatch({
      type: ActionTypes.TOGGLE_ACTION,
      index,
      toggleMany
    });
  }

  handleReset() {
    this.props.dispatch({
      type: ActionTypes.RESET
    });
  }

  render() {
    const elements = [];
    const { disabledActions, log, error, select } = this.props;

    for (let i = 0; i < log.length; i++) {
      const { action, state } = log[i];

      let errorText;
      if (error) {
        if (error.index === i) {
          errorText = error.text;
        } else if (error.index < i) {
          errorText = 'Interrupted by an error up the chain.';
        }
      }

      elements.push(
        <ReduxMonitorEntry key={i}
                           index={i}
                           select={select}
                           action={action}
                           state={state}
                           collapsed={disabledActions[i]}
                           errorText={errorText}
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
          {log.length > 1 &&
            <a onClick={::this.handleRollback}
               style={{ textDecoration: 'underline', cursor: 'hand' }}>
              Rollback
            </a>
          }
          {values(disabledActions).some(identity) &&
            <span>
              {' • '}
              <a onClick={::this.handleSweep}
                 style={{ textDecoration: 'underline', cursor: 'hand' }}>
                Sweep
              </a>
            </span>
          }
          {log.length > 1 &&
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
