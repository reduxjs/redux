import React from 'react';
import Injector from '../Injector';
import getDisplayName from '../utils/getDisplayName';

function mergeAll({ props, atom, actions }) {
  return { ...props, ...atom, ...actions };
}

export default function inject(
  { actions: actionsToInject },
  getChildProps = mergeAll
) {
  return DecoratedComponent => class InjectorDecorator {
    static displayName = `Injector(${getDisplayName(DecoratedComponent)})`;

    constructor() {
      this.renderChild = this.renderChild.bind(this);
    }

    render() {
      return (
        <Injector actions={actionsToInject}>
          {this.renderChild}
        </Injector>
      );
    }

    renderChild({ atom, actions }) {
      const { props } = this;
      const childProps = getChildProps({ props, atom, actions });

      return <DecoratedComponent {...childProps} />;
    }
  };
}
