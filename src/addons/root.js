import React from 'react';
import Root from '../Root';
import getDisplayName from './getDisplayName';

export default function root(stores, dispatcher = null) {
  return DecoratedComponent => class ReduxRootDecorator {
    static displayName = `ReduxRoot(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Root dispatcher={dispatcher} stores={stores}>
          {props => <DecoratedComponent {...this.props} {...props} />}
        </Root>
      );
    }
  };
}
