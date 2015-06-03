import React from 'react';
import Root from '../Root';

export default function root(DecoratedComponent) {
  return class ReduxRootDecorator {
    render() {
      return (
        <Root>
          {props => <DecoratedComponent {...props} />}
        </Root>
      );
    }
  }
}
