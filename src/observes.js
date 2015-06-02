import React, { Component, PropTypes } from 'react';
import pick from 'lodash/object/pick';
import identity from 'lodash/utility/identity';

const contextTypes = {
  observeStores: PropTypes.func.isRequired
};

export default function connect(...storeKeys) {
  let mapState = identity;

  // Last argument may be a custom mapState function
  const lastIndex = storeKeys.length - 1;
  if (typeof storeKeys[lastIndex] === 'function') {
    [mapState] = storeKeys.splice(lastIndex, 1);
  }

  return function (DecoratedComponent) {
    const wrappedDisplayName =
      DecoratedComponent.displayName ||
      DecoratedComponent.name ||
      'Component';

    return class extends Component {
      static displayName = `ReduxObserves(${wrappedDisplayName})`;
      static contextTypes = contextTypes;

      constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);
        this.unobserve = this.context.observeStores(storeKeys, this.handleChange);
      }

      handleChange(stateFromStores) {
        this.currentStateFromStores = pick(stateFromStores, storeKeys);
        this.updateState(stateFromStores, this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.updateState(this.currentStateFromStores, nextProps);
      }

      updateState(stateFromStores, props) {
        if (storeKeys.length === 1) {
          // Just give it the particular store state for convenience
          stateFromStores = stateFromStores[storeKeys[0]];
        }

        const state = mapState(stateFromStores, props);
        if (this.state) {
          this.setState(state);
        } else {
          this.state = state;
        }
      }

      componentWillUnmount() {
        this.unobserve();
      }

      render() {
        return (
          <DecoratedComponent {...this.props}
                              {...this.state} />
        );
      }
    };
  };
}
