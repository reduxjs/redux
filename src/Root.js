import React, { PropTypes } from 'react';
import createDispatcher from './createDispatcher';

export default class ReduxRoot {
  static propTypes = {
    children: PropTypes.func.isRequired
  };

  static childContextTypes = {
    redux: PropTypes.object.isRequired
  };

  constructor() {
    this.dispatcher = createDispatcher();
  }

  getChildContext() {
    const { observeStores, wrapActionCreator } = this.dispatcher
    return {
      redux: {
        observeStores,
        wrapActionCreator
      }
    };
  }

  render() {
    return this.props.children({
      ...this.props
    });
  }
}
