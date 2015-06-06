import React from 'react';
import Injector from '../Injector';
import getDisplayName from '../utils/getDisplayName';
import shallowEqualScalar from '../utils/shallowEqualScalar';

function mergeAll({ props, state, actions }) {
  return { ...props, ...state, ...actions };
}

export default function inject(
  { actions: actionsToInject },
  getChildProps = mergeAll
) {
  return DecoratedComponent => class InjectorDecorator {
    static displayName = `Injector(${getDisplayName(DecoratedComponent)})`;

    shouldComponentUpdate(nextProps) {
      return !shallowEqualScalar(this.props, nextProps);
    }

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

    renderChild({ state, actions }) {
      const { props } = this;
      const childProps = getChildProps({ props, state, actions });

      return <DecoratedComponent {...childProps} />;
    }
  };
}
