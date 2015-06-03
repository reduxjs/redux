import React from 'react';
import Root from '../Root';
import getDisplayName from './getDisplayName';

export default function root(DecoratedComponent) {
  return class ReduxRootDecorator {
    static displayName = `ReduxRoot(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Root>
          {props => <DecoratedComponent {...this.props} {...props} />}
        </Root>
      );
    }
  };
}
