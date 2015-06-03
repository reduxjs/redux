import { Component, PropTypes } from 'react';
import mapValues from 'lodash/object/mapValues';
import identity from 'lodash/utility/identity';
import invariant from 'invariant';
import isPlainObject from 'lodash/lang/isPlainObject';

export default class ReduxContainer extends Component {
  static contextTypes = {
    redux: PropTypes.object.isRequired
  };

  static propTypes = {
    children: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    stores: PropTypes.arrayOf(PropTypes.func.isRequired).isRequired
  }

  static defaultProps = {
    stores: [],
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
    invariant(
      isPlainObject(actions) &&
      Object.keys(actions).every(key => typeof actions[key] === 'function'),
      '"actions" must be a plain object with functions as values. Did you misspell an import?'
    );
    invariant(
      Array.isArray(stores) &&
      stores.every(s => typeof s === 'function'),
      '"stores" must be an array of functions. Did you misspell an import?'
    );

    const { wrapActionCreator, observeStores, getStoreKey } = this.context.redux;
    this.actions = mapValues(props.actions, wrapActionCreator);

    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.mapState = (stores.length === 1) ?
      state => state[getStoreKey(stores[0])] :
      identity;

    this.unsubscribe = observeStores(stores, this.handleChange);
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
    return this.props.children({
      ...this.actions,
      ...this.state
    });
  }
}
