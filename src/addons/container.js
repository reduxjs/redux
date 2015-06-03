import React from 'react';
import Container from '../Container';
import getDisplayName from './getDisplayName';

export default function container(options) {
  return (DecoratedComponent) => class ReduxContainerDecorator {
    static displayName = `ReduxContainer(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Container {...options}>
          {props => <DecoratedComponent {...this.props} {...props} />}
        </Container>
      );
    }
  };
}
