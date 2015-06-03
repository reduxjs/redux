import React, { Component, PropTypes } from 'react';
import createDispatcher from './createDispatcher';

export default function root(DecoratedComponent) {
  return class ReduxRoot extends Component {
    static childContextTypes = {
      observeStores: PropTypes.func.isRequired,
      wrapActionCreator: PropTypes.func.isRequired
    };

    getChildContext() {
      return {
        observeStores: this.dispatcher.observeStores,
        wrapActionCreator: this.dispatcher.wrapActionCreator
      };
    }

    constructor(props, context) {
      super(props, context);
      this.dispatcher = createDispatcher();
    }

    render() {
      return <DecoratedComponent {...this.props} />;
    }
  };
}
