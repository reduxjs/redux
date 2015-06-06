import { PropTypes } from 'react';
import Dispatcher from '../Dispatcher';

export default class Provider {
  static propTypes = {
    dispatcher: PropTypes.instanceOf(Dispatcher).isRequired,
    children: PropTypes.func.isRequired
  };

  static childContextTypes = {
    redux: PropTypes.instanceOf(Provider).isRequired
  };

  getChildContext() {
    return { redux: this };
  }

  constructor() {
    this.dispatch = this.dispatch.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    nextProps.dispatcher.hydrate(
      this.props.dispatcher.dehydrate()
    );
  }

  subscribe(listener) {
    return this.props.dispatcher.subscribe(listener);
  }

  dispatch(action) {
    return this.props.dispatcher.dispatch(action);
  }

  render() {
    const { children } = this.props;
    return children();
  }
}
