import { Component, PropTypes } from 'react';
import identity from 'lodash/utility/identity';
import mapValues from 'lodash/object/mapValues';
import shallowEqual from './utils/shallowEqual';

export default class Injector extends Component {
  static contextTypes = {
    redux: PropTypes.object.isRequired
  };

  static propTypes = {
    children: PropTypes.func.isRequired,
    actions: PropTypes.objectOf(
      PropTypes.func.isRequired
    ).isRequired
  };

  static defaultProps = {
    actions: {},
    select: identity
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !this.isSliceEqual(this.state.slice, nextState.slice) ||
           !shallowEqual(this.props, nextProps);
  }

  isSliceEqual(slice, nextSlice) {
    const isRefEqual = slice === nextSlice;
    if (isRefEqual) {
      return true;
    } else if (typeof slice !== 'object' || typeof nextSlice !== 'object') {
      return isRefEqual;
    } else {
      return shallowEqual(slice, nextSlice);
    }
  }

  constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);
    this.unsubscribe = context.redux.subscribe(this.handleChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  performAction(actionCreator, ...args) {
    const { dispatch, atom } = this.context.redux;
    const payload = actionCreator(...args);

    return typeof payload === 'function'
      ? payload(dispatch, atom)
      : dispatch(payload);
  }

  handleChange(atom) {
    const slice = this.props.select(atom);
    if (this.state) {
      this.setState({ slice });
    } else {
      this.state = { slice };
    }
  }

  render() {
    const { children, actions: _actions } = this.props;
    const { slice: state } = this.state;

    const actions = mapValues(_actions, actionCreator =>
      this.performAction.bind(this, actionCreator)
    );

    return children({ state, actions });
  }
}
