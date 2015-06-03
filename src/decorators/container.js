import React from 'react';
import Container from '../Container';

export default function container({ actions = {}, stores = [] }) {
  return (DecoratedComponent) => {
    return class ReduxContainerDecorator {
      render() {
        return (
          <Container actions={actions} stores={stores}>
            {props => <DecoratedComponent {...this.props} {...props} />}
          </Container>
        );
      }
    };
  };
}
