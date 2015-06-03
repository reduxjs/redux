import { PropTypes } from 'react';
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
    return { redux: this.dispatcher };
  }

  render() {
    return this.props.children({
      ...this.props
    });
  }
}
