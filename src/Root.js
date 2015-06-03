import { PropTypes } from 'react';
import createDispatcher from './createDispatcher';

export default class ReduxRoot {
  static propTypes = {
    stores: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired
  };

  static childContextTypes = {
    redux: PropTypes.object.isRequired
  };

  constructor(props) {
    this.dispatcher = createDispatcher();
    this.dispatcher.receiveStores(props.stores);
  }

  componentWillReceiveProps(nextProps) {
    this.dispatcher.receiveStores(nextProps.stores);
  }

  getChildContext() {
    return { redux: this.dispatcher };
  }

  render() {
    return this.props.children();
  }
}
