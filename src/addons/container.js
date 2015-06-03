import React from 'react';
import Container from '../Container';
import getDisplayName from './getDisplayName';

export default function container({ actions, stores }) {
  return (DecoratedComponent) => class ReduxContainerDecorator {
    static displayName = `ReduxContainer(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Container actions={actions} stores={stores}>
          {props => <DecoratedComponent {...this.props} {...props} />}
        </Container>
      );
    }
  };
}
