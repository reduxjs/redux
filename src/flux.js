import React, { PropTypes } from 'react';

const childContextTypes = {
  observeStores: PropTypes.func.isRequired,
  getActions: PropTypes.func.isRequired
};

export default function flux(dispatcher) {
  return function (DecoratedComponent) {
    const wrappedDisplayName =
      DecoratedComponent.displayName ||
      DecoratedComponent.name ||
      'Component';

    return class {
      static displayName = `Redux(${wrappedDisplayName})`;
      static childContextTypes = childContextTypes;

      getChildContext() {
        return {
          observeStores: dispatcher.observeStores,
          getActions: dispatcher.getActions
        };
      }

      render() {
        return (
          <DecoratedComponent {...this.props} />
        );
      }
    };
  };
}
