import React, { Children, Component, PropTypes } from 'react';
import invariant from 'invariant';
import mapValues from 'lodash/object/mapValues';
import identity from 'lodash/utility/identity';
import invariant from 'invariant';
import isFunction from 'lodash/lang/isFunction';
import isPlainObject from 'lodash/lang/isPlainObject';

export default class ReduxContainer extends Component {
  static contextTypes = {
    redux: PropTypes.object.isRequired
  };

  static propTypes = {
    Wrapper: PropTypes.oneOfType([
      PropTypes.func.isRequired,
      PropTypes.string.isRequired
    ]).isRequired,
    children: PropTypes.oneOfType([
      PropTypes.func.isRequired,
      PropTypes.element.isRequired,
      PropTypes.arrayOf(PropTypes.element.isRequired).isRequired
    ]).isRequired,
    actions: PropTypes.object.isRequired,
    stores: PropTypes.arrayOf(PropTypes.func.isRequired).isRequired
  }

  static defaultProps = {
    stores: [],
    actions: {},
    Wrapper: 'span'
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
      isPlainObject(actions) && Object.keys(actions).every(isFunction),
      '"actions" must be a plain object with functions as values. Did you misspell an import?'
    );
    invariant(
      Array.isArray(stores) && stores.every(isFunction),
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
    const { children, Wrapper } = this.props;
    const props = {
      ...this.actions,
      ...this.state
    };

    if (isFunction(children)) {
      return children(props);
    }

    if (Array.isArray(children)) {
      return (
        <Wrapper>
          {Children.map(children, (child) => React.cloneElement(child, props))}
        </Wrapper>
      );
    }

    invariant(
      React.isValidElement(children),
      'The redux container must render a single component'
    );

    return React.cloneElement(children, props);
  }
}
