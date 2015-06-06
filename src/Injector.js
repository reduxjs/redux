import { Component, PropTypes } from 'react';
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
  }

  static defaultProps = {
    actions: {}
  };

  shouldComponentUpdate(nextProps, nextState) {
    return this.hasChanged(this.state.atom, nextState.atom) ||
           !shallowEqual(this.props.actions, nextProps.actions);
  }

  hasChanged(atom, prevAtom) {
    return atom !== prevAtom;
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
    if (this.state) {
      this.setState({ atom });
    } else {
      this.state = { atom };
    }
  }

  render() {
    const { children, actions: _actions } = this.props;
    const { atom } = this.state;

    const actions = mapValues(_actions, actionCreator =>
      this.performAction.bind(this, actionCreator)
    );

    return children({ state: atom, actions });
  }
}
