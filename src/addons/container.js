import React from 'react';
import Container from '../Container';
import getDisplayName from './getDisplayName';

function defaultTransformProps({ state, actions }) {
  return { ...state, ...actions };
}

export default function container(
  { actions, stores },
  transformProps = defaultTransformProps
) {
  return (DecoratedComponent) => class ReduxContainerDecorator {
    static displayName = `ReduxContainer(${getDisplayName(DecoratedComponent)})`;

    render() {
      return (
        <Container actions={actions} stores={stores}>
          {props => <DecoratedComponent {...this.props}
                                        {...transformProps(props)} />}
        </Container>
      );
    }
  };
}
