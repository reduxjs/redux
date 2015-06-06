import React from 'react';
import Connector from './Connector';
import getDisplayName from '../utils/getDisplayName';
import shallowEqualScalar from '../utils/shallowEqualScalar';

function mergeAll({ props, state, actions }) {
  return { ...props, ...state, ...actions };
}

export default function connect(
  { actions: actionsToInject, select },
  getChildProps = mergeAll
) {
  return DecoratedComponent => class ConnectorDecorator {
    static displayName = `Connector(${getDisplayName(DecoratedComponent)})`;

    shouldComponentUpdate(nextProps) {
      return !shallowEqualScalar(this.props, nextProps);
    }

    constructor() {
      this.renderChild = this.renderChild.bind(this);
    }

    render() {
      return (
        <Connector actions={actionsToInject}
                  select={select}>
          {this.renderChild}
        </Connector>
      );
    }

    renderChild({ state, actions }) {
      const { props } = this;
      const childProps = getChildProps({ props, state, actions });

      return <DecoratedComponent {...childProps} />;
    }
  };
}
