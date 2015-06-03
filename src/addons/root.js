import React from 'react';
import Root from '../Root';
import getDisplayName from './getDisplayName';

export default function root(stores) {
  return DecoratedComponent => class ReduxRootDecorator {
    static displayName = `ReduxRoot(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Root stores={stores}>
          {props => <DecoratedComponent {...this.props} {...props} />}
        </Root>
      );
    }
  };
}
