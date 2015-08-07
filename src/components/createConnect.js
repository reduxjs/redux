import createStoreShape from '../utils/createStoreShape';
import shallowEqualScalar from '../utils/shallowEqualScalar';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import wrapActionCreators from '../utils/wrapActionCreators';
import invariant from 'invariant';

const emptySelector = () => ({});
const emptyBinder = () => ({});
const identityMerge = (slice, actionsCreators, props) => ({
  ...props,
  ...slice,
  ...actionsCreators
});

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function createConnect(React) {
  const { Component, PropTypes } = React;
  const storeShape = createStoreShape(PropTypes);

  return function connect(
    select,
    dispatchBinder = emptyBinder,
    mergeHandler = identityMerge
  ) {
    const shouldSubscribe = select ? true : false;
    const selectState = select || emptySelector;
    const bindDispatch = isPlainObject(dispatchBinder) ?
      wrapActionCreators(dispatchBinder) :
      dispatchBinder;
    const merge = mergeHandler;

    return DecoratedComponent => class ConnectDecorator extends Component {
      static displayName = `Connect(${getDisplayName(DecoratedComponent)})`;
      static DecoratedComponent = DecoratedComponent;

      static contextTypes = {
        store: storeShape.isRequired
      };

      shouldComponentUpdate(nextProps, nextState) {
        return (this.subscribed && !this.isSliceEqual(this.state.slice, nextState.slice)) ||
               !shallowEqualScalar(this.props, nextProps);
      }

      isSliceEqual(slice, nextSlice) {
        const isRefEqual = slice === nextSlice;
        if (
          isRefEqual ||
          typeof slice !== 'object' ||
          typeof nextSlice !== 'object'
        ) {
          return isRefEqual;
        }

        return shallowEqual(slice, nextSlice);
      }

      constructor(props, context) {
        super(props, context);
        this.setUnderlyingRef = ::this.setUnderlyingRef;
        this.state = {
          ...this.selectState(props, context),
          ...this.bindDispatch(context)
        };
      }

      componentDidMount() {
        if (shouldSubscribe) {
          this.subscribed = true;
          this.unsubscribe = this.context.store.subscribe(::this.handleChange);
        }
      }

      componentWillUnmount() {
        if (shouldSubscribe) {
          this.unsubscribe();
        }
      }

      handleChange(props = this.props) {
        const nextState = this.selectState(props, this.context);
        if (!this.isSliceEqual(this.state.slice, nextState.slice)) {
          this.setState(nextState);
        }
      }

      selectState(props = this.props, context = this.context) {
        const state = context.store.getState();
        const slice = selectState(state);

        invariant(
          isPlainObject(slice),
          'The return value of `select` prop must be an object. Instead received %s.',
          slice
        );

        return { slice };
      }

      bindDispatch(context = this.context) {
        const { dispatch } = context.store;
        const actionCreators = bindDispatch(dispatch);

        invariant(
          isPlainObject(actionCreators),
          'The return value of `bindDispatch` prop must be an object. Instead received %s.',
          actionCreators
        );

        return { actionCreators };
      }

      merge(props = this.props, state = this.state) {
        const { slice, actionCreators } = state;
        const merged = merge(slice, actionCreators, props);

        invariant(
          isPlainObject(merged),
          'The return value of `merge` prop must be an object. Instead received %s.',
          merged
        );

        return merged;
      }

      getUnderlyingRef() {
        return this.underlyingRef;
      }

      setUnderlyingRef(instance) {
        this.underlyingRef = instance;
      }

      render() {
        return (
          <DecoratedComponent ref={this.setUnderlyingRef}
                              {...this.merge()} />
        );
      }
    };
  };
}
