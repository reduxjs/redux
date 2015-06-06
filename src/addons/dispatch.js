import React from 'react';
import Dispatcher from '../Dispatcher';
import getDisplayName from '../utils/getDisplayName';

export default function dispatch(store) {
  return DecoratedComponent => class DispatcherDecorator {
    static displayName = `Dispatcher(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Dispatcher store={store}>
          {props => <DecoratedComponent {...this.props} {...props} />}
        </Dispatcher>
      );
    }
  };
}
