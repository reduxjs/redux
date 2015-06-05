import { Component, PropTypes } from 'react';
import values from 'lodash/object/values';
import mapValues from 'lodash/object/mapValues';
import invariant from 'invariant';
import isPlainObject from 'lodash/lang/isPlainObject';
import isFunction from 'lodash/lang/isFunction';

export default class ReduxInjector extends Component {
  static contextTypes = {
    redux: PropTypes.object.isRequired
  };

  static propTypes = {
    children: PropTypes.func.isRequired,
    actions: PropTypes.objectOf(
      PropTypes.func.isRequired
    ).isRequired,
    stores: PropTypes.objectOf(
      PropTypes.func.isRequired
    ).isRequired
  }

  static defaultProps = {
    stores: {},
    actions: {}
  };

  constructor(props, context) {
    super(props, context);
    this.handleChange = this.handleChange.bind(this);
    this.update(props);
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  update(props) {
    const { stores, actions } = props;

    if (process.env.NODE_ENV !== 'production') {
      invariant(
        isPlainObject(actions),
        '"actions" must be a plain object with functions as values. Instead received: %s.',
        actions
      );
      invariant(
        isPlainObject(stores),
        '"stores" must be a plain object with functions as values. Instead received: %s.',
        stores
      );
      Object.keys(actions).forEach(key =>
        invariant(
          isFunction(actions[key]),
          'Expected "%s" in "actions" to be a function. Instead received: %s.',
          key,
          actions[key]
        )
      );
      Object.keys(stores).forEach(key =>
        invariant(
          isFunction(stores[key]),
          'Expected "%s" in "stores" to be a function. Instead received: %s.',
          key,
          stores[key]
        )
      );
    }

    const { wrapActionCreator, observeStores } = this.context.redux;
    this.actions = mapValues(props.actions, wrapActionCreator);

    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = observeStores(values(stores), this.handleChange);
  }

  mapState(stateFromStores) {
    const { getStoreKey } = this.context.redux;
    return mapValues(this.props.stores, store =>
      stateFromStores[getStoreKey(store)]
    );
  }

  handleChange(stateFromStores) {
    const nextState = this.mapState(stateFromStores);
    if (this.state) {
      this.setState(nextState);
    } else {
      this.state = nextState;
    }
  }

  render() {
    const { children } = this.props;
    return children({
      state: this.state,
      actions: this.actions
    });
  }
}
