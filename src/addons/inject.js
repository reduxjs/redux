import React from 'react';
import Injector from '../Injector';
import getDisplayName from './getDisplayName';

function mergePropsStateAndActions({ props, state, actions }) {
  return { ...props, ...state, ...actions };
}

export default function inject(
  { actions: actionsToInject, stores: storesToConnect },
  getChildProps = mergePropsStateAndActions
) {
  return DecoratedComponent => class ReduxInjectorDecorator {
    static displayName = `ReduxInjector(${getDisplayName(DecoratedComponent)})`;

    constructor() {
      this.renderChild = this.renderChild.bind(this);
    }

    render() {
      return (
        <Injector actions={actionsToInject}
                  stores={storesToConnect}>
          {this.renderChild}
        </Injector>
      );
    }

    renderChild({ state, actions }) {
      const { props } = this;
      const childProps = getChildProps({ props, state, actions });

      return <DecoratedComponent {...childProps} />;
    }
  };
}
