import React, { Component, PropTypes } from 'react';
import isPlainObject from 'lodash/lang/isPlainObject';

const contextTypes = {
  observeStores: PropTypes.func.isRequired,
  getActions: PropTypes.func.isRequired
};

function extractShorthandArguments(storeMap) {
  const storeKeys = Object.keys(storeMap);

  function mapState(stateFromStores, props) {
    let state = {};
    storeKeys.forEach(key => {
      const stateFromStore = stateFromStores[key];
      const mapStoreState = storeMap[key];
      state = { ...state, ...mapStoreState(stateFromStore, props) };
    });
    return state;
  }

  return {
    storeKeys,
    mapState
  };
}

export default function connect(storeKeys = [], mapState = () => {}) {
  if (isPlainObject(storeKeys)) {
    ({ storeKeys, mapState } = extractShorthandArguments(storeKeys));
  } else if (!Array.isArray(storeKeys)) {
    throw new Error('Pass either a string array or an object as the first argument.');
  }

  return function (DecoratedComponent) {
    const wrappedDisplayName =
      DecoratedComponent.displayName ||
      DecoratedComponent.name ||
      'Component';

    return class extends Component {
      static displayName = `ReduxConnect(${wrappedDisplayName})`;
      static contextTypes = contextTypes;

      constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);

        this.unobserve = this.context.observeStores(storeKeys, this.handleChange);
        this.actions = this.context.getActions();
      }

      handleChange(stateFromStores) {
        this.currentStateFromStores = stateFromStores;
        this.updateState(stateFromStores, this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.updateState(this.currentStateFromStores, nextProps);
      }

      updateState(stateFromStores, props) {
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
                              {...this.state}
                              actions={this.actions} />
        );
      }
    };
  };
}
