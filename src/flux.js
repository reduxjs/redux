import React, { PropTypes } from 'react';

const childContextTypes = {
  observeStores: PropTypes.func.isRequired,
  bindActions: PropTypes.func.isRequired
};

export default function flux(dispatcher) {
  const { observeStores, bindActions } = dispatcher;
  const childContext = { observeStores, bindActions };

  return function (DecoratedComponent) {
    const wrappedDisplayName =
      DecoratedComponent.displayName ||
      DecoratedComponent.name ||
      'Component';

    return class {
      static displayName = `Redux(${wrappedDisplayName})`;
      static childContextTypes = childContextTypes;

      getChildContext() {
        return childContext;
      }

      render() {
        return (
          <DecoratedComponent {...this.props} />
        );
      }
    };
  };
}
