import React, { Component, PropTypes } from 'react';

const contextTypes = {
  observeStores: PropTypes.func.isRequired,
  getActions: PropTypes.func.isRequired
};

export default function connect(stateGetters = {}) {
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

        this.unobserve = this.context.observeStores(stateGetters, this.handleChange);
        this.actions = this.context.getActions();
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
                              actions={this.actions} />
        );
      }
    };
  };
}
