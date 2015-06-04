import { PropTypes } from 'react';
import createDispatcher from './createDispatcher';

export default class ReduxRoot {
  static propTypes = {
    dispatcher: PropTypes.object,
    stores: PropTypes.object,
    children: PropTypes.func.isRequired
  };

  static childContextTypes = {
    redux: PropTypes.object.isRequired
  };

  constructor(props) {
    this.dispatcher = props.dispatcher || createDispatcher();
    if (props.stores) {
      this.dispatcher.receiveStores(props.stores);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dispatcher) {
      this.dispatcher = nextProps.dispatcher;
    }
    if (nextProps.stores) {
      this.dispatcher.receiveStores(nextProps.stores);
    }
  }

  getChildContext() {
    return { redux: this.dispatcher };
  }

  render() {
    return this.props.children();
  }
}
