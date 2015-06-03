import React, { Component, PropTypes } from 'react';
import createDispatcher from './createDispatcher';

export default function root(DecoratedComponent) {
  return class ReduxRoot extends Component {
    static childContextTypes = {
      redux: PropTypes.object.isRequired
    };

    getChildContext() {
      return { redux: this.dispatcher };
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
