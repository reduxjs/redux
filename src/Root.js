import React, { Component, PropTypes } from 'react';
import createDispatcher from './createDispatcher';

export default function root(DecoratedComponent) {
  return class ReduxRoot extends Component {
    static childContextTypes = {
      redux: PropTypes.object.isRequired
    };

    getChildContext() {
      const { observeStores, wrapActionCreator } = this.dispatcher
      return {
        redux: {
          observeStores,
          wrapActionCreator
        }
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
