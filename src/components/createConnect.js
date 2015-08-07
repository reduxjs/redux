import createStoreShape from '../utils/createStoreShape';
import shallowEqualScalar from '../utils/shallowEqualScalar';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import wrapActionCreators from '../utils/wrapActionCreators';
import invariant from 'invariant';

const defaultMapState = () => ({});
const defaultMapDispatch = dispatch => ({ dispatch });
const defaultMergeProps = (stateSlice, actionsCreators, props) => ({
  ...props,
  ...stateSlice,
  ...actionsCreators
});

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function createConnect(React) {
  const { Component, PropTypes } = React;
  const storeShape = createStoreShape(PropTypes);

  return function connect(
    mapState = defaultMapState,
    mapDispatchOrActionCreators = defaultMapDispatch,
    mergeProps = defaultMergeProps
  ) {
    const shouldSubscribe = mapState !== defaultMapState;
    const mapDispatch = isPlainObject(mapDispatchOrActionCreators) ?
      wrapActionCreators(mapDispatchOrActionCreators) :
      mapDispatchOrActionCreators;

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
          ...this.mapState(props, context),
          ...this.mapDispatch(context)
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
        const nextState = this.mapState(props, this.context);
        if (!this.isSliceEqual(this.state.slice, nextState.slice)) {
          this.setState(nextState);
        }
      }

      mapState(props = this.props, context = this.context) {
        const state = context.store.getState();
        const slice = mapState(state);

        invariant(
          isPlainObject(slice),
          '`mapState` must return an object. Instead received %s.',
          slice
        );

        return { slice };
      }

      mapDispatch(context = this.context) {
        const { dispatch } = context.store;
        const actionCreators = mapDispatch(dispatch);

        invariant(
          isPlainObject(actionCreators),
          '`mapDispatch` must return an object. Instead received %s.',
          actionCreators
        );

        return { actionCreators };
      }

      merge(props = this.props, state = this.state) {
        const { slice, actionCreators } = state;
        const merged = mergeProps(slice, actionCreators, props);

        invariant(
          isPlainObject(merged),
          '`mergeProps` must return an object. Instead received %s.',
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
