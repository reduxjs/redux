import React from 'react';
import Dispatcher from '../Dispatcher';
import getDisplayName from './getDisplayName';

export default function dispatch(stores) {
  return DecoratedComponent => class ReduxDispatcherDecorator {
    static displayName = `ReduxDispatcher(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Dispatcher stores={stores}>
          {props => <DecoratedComponent {...this.props} {...props} />}
        </Dispatcher>
      );
    }
  };
}
