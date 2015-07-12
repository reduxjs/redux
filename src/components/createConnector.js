import createStoreShape from '../utils/createStoreShape';
import identity from '../utils/identity';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import invariant from 'invariant';

export default function createConnector(React) {
  const { Component, PropTypes } = React;
  const storeShape = createStoreShape(PropTypes);

  return class Connector extends Component {
    static contextTypes = {
      store: storeShape.isRequired
    };

    static propTypes = {
      children: PropTypes.func.isRequired,
      select: PropTypes.func.isRequired
    };

    static defaultProps = {
      select: identity
    };

    shouldComponentUpdate(nextProps, nextState) {
      return !shallowEqual(this.state.slice, nextState.slice) ||
             !shallowEqual(this.props, nextProps);
    }

    constructor(props, context) {
      super(props, context);
      this.state = this.selectState(props, context);
    }

    componentDidMount() {
      this.unsubscribe = this.context.store.subscribe(::this.handleChange);
      this.handleChange();
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.select !== this.props.select) {
        // Force the state slice recalculation
        this.handleChange(nextProps);
      }
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    handleChange(props = this.props) {
      const nextState = this.selectState(props, this.context);
      if (!shallowEqual(this.state.slice, nextState.slice)) {
        this.setState(nextState);
      }
    }

    selectState(props, context) {
      const state = context.store.getState();
      const slice = props.select(state);

      invariant(
        isPlainObject(slice),
        'The return value of `select` prop must be an object. Instead received %s.',
        slice
      );

      return { slice };
    }

    render() {
      const { children } = this.props;
      const { slice } = this.state;
      const { store: { dispatch } } = this.context;

      return children({ dispatch, ...slice });
    }
  };
}
