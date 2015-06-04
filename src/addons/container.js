import React from 'react';
import Container from '../Container';
import getDisplayName from './getDisplayName';

function mergePropsStateAndActions({ props, state, actions }) {
  return { ...props, ...state, ...actions };
}

export default function container(
  { actions: actionsToInject, stores: storesToConnect },
  getChildProps = mergePropsStateAndActions
) {
  return DecoratedComponent => class ReduxContainerDecorator {
    static displayName = `ReduxContainer(${getDisplayName(DecoratedComponent)})`;

    constructor() {
      this.renderChild = this.renderChild.bind(this);
    }

    render() {
      return (
        <Container actions={actionsToInject}
                   stores={storesToConnect}>
          {this.renderChild}
        </Container>
      );
    }

    renderChild({ state, actions }) {
      const { props } = this;
      const childProps = getChildProps({ props, state, actions });

      return <DecoratedComponent {...childProps} />;
    }
  };
}
