import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { Provider, Connector } from 'react-redux';
import { ActionCreators } from './index';
import Monitor from './Monitor';

export default class ReduxMonitor {
  static propTypes = {
    store: PropTypes.shape({
      devToolsStore: PropTypes.shape({
        dispatch: PropTypes.func.isRequired
      }).isRequired
    }).isRequired,
    select: PropTypes.func
  };

  render() {
    const { devToolsStore } = this.props.store;
    return (
      <Provider store={devToolsStore}>
        {this.renderRoot}
      </Provider>
    );
  }

  renderRoot = () => {
    return (
      <Connector>
        {this.renderMonitor}
      </Connector>
    );
  };

  renderMonitor = ({ dispatch, ...props }) => {
    return (
      <Monitor {...props}
               {...bindActionCreators(ActionCreators, dispatch)}
               select={this.props.select} />
    );
  };
}
