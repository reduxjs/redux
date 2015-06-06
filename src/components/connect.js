import React from 'react';
import Connector from './Connector';
import getDisplayName from '../utils/getDisplayName';
import shallowEqualScalar from '../utils/shallowEqualScalar';

export default function connect(select) {
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
        <Connector select={state => select(state, this.props)}>
          {this.renderChild}
        </Connector>
      );
    }

    renderChild(state) {
      const { props } = this;
      return <DecoratedComponent {...props} {...state} />;
    }
  };
}
