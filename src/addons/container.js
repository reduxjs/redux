import React from 'react';
import Container from '../Container';
import getDisplayName from './getDisplayName';

function defaultTransformProps({ props, state, actions }) {
  return { ...props, ...state, ...actions };
}

export default function container(
  { actions, stores },
  transformProps = defaultTransformProps
) {
  return DecoratedComponent => class ReduxContainerDecorator {
    static displayName = `ReduxContainer(${getDisplayName(DecoratedComponent)})`;

    render() {
      const {props} = this
      
      return (
        <Container actions={actions} stores={stores}>
          {({state, actions}) => <DecoratedComponent {...transformProps({props, state, actions})} />}
        </Container>
      );
    }
  };
}
