import React, { Component, PropTypes } from 'react';

const contextTypes = {
  observeStores: PropTypes.func.isRequired,
  bindActions: PropTypes.func.isRequired
};

export default function connect(pickStores, pickActions) {
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

        this.actions = this.context.bindActions(pickActions);
        this.unobserve = this.context.observeStores(pickStores, this.handleChange);
      }

      handleChange(state) {
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
                              {...this.actions} />
        );
      }
    };
  };
}
