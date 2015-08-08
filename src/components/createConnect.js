import createStoreShape from '../utils/createStoreShape';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import wrapActionCreators from '../utils/wrapActionCreators';
import invariant from 'invariant';

const defaultMapStateToProps = () => ({});
const defaultMapDispatchToProps = dispatch => ({ dispatch });
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
  ...parentProps,
  ...stateProps,
  ...dispatchProps
});

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

// Helps track hot reloading.
let nextVersion = 0;

export default function createConnect(React) {
  const { Component, PropTypes } = React;
  const storeShape = createStoreShape(PropTypes);

  return function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
    const shouldSubscribe = Boolean(mapStateToProps);
    const finalMapStateToProps = mapStateToProps || defaultMapStateToProps;
    const finalMapDispatchToProps = isPlainObject(mapDispatchToProps) ?
      wrapActionCreators(mapDispatchToProps) :
      mapDispatchToProps || defaultMapDispatchToProps;
    const finalMergeProps = mergeProps || defaultMergeProps;

    // Helps track hot reloading.
    const version = nextVersion++;

    function computeStateProps(context) {
      const state = context.store.getState();
      const stateProps = finalMapStateToProps(state);
      invariant(
        isPlainObject(stateProps),
        '`mapStateToProps` must return an object. Instead received %s.',
        stateProps
      );
      return stateProps;
    }

    function computeDispatchProps(context) {
      const { dispatch } = context.store;
      const dispatchProps = finalMapDispatchToProps(dispatch);
      invariant(
        isPlainObject(dispatchProps),
        '`mapDispatchToProps` must return an object. Instead received %s.',
        dispatchProps
      );
      return dispatchProps;
    }

    function computeNextState(stateProps, dispatchProps, parentProps) {
      const mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
      invariant(
        isPlainObject(mergedProps),
        '`mergeProps` must return an object. Instead received %s.',
        mergedProps
      );
      return mergedProps;
    }

    return DecoratedComponent => class Connect extends Component {
      static displayName = `Connect(${getDisplayName(DecoratedComponent)})`;
      static DecoratedComponent = DecoratedComponent;

      static contextTypes = {
        store: storeShape.isRequired
      };

      shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.state, nextState);
      }

      constructor(props, context) {
        super(props, context);
        this.version = version;
        this.setUnderlyingRef = ::this.setUnderlyingRef;

        this.stateProps = computeStateProps(context);
        this.dispatchProps = computeDispatchProps(context);
        this.state = this.computeNextState();
      }

      recomputeStateProps() {
        const nextStateProps = computeStateProps(this.context);
        if (shallowEqual(nextStateProps, this.stateProps)) {
          return false;
        }

        this.stateProps = nextStateProps;
        return true;
      }

      recomputeDispatchProps() {
        const nextDispatchProps = computeDispatchProps(this.context);
        if (shallowEqual(nextDispatchProps, this.dispatchProps)) {
          return false;
        }

        this.dispatchProps = nextDispatchProps;
        return true;
      }

      computeNextState(props = this.props) {
        return computeNextState(
          this.stateProps,
          this.dispatchProps,
          props
        );
      }

      recomputeState(props = this.props) {
        const nextState = this.computeNextState(props);
        if (!shallowEqual(nextState, this.state)) {
          this.setState(nextState);
        }
      }

      isSubscribed() {
        return typeof this.unsubscribe === 'function';
      }

      trySubscribe() {
        if (shouldSubscribe && !this.unsubscribe) {
          this.unsubscribe = this.context.store.subscribe(::this.handleChange);
          this.handleChange();
        }
      }

      tryUnsubscribe() {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }

      componentDidMount() {
        this.trySubscribe();
      }

      componentWillUpdate() {
        if (process.env.NODE_ENV !== 'production') {
          if (this.version === version) {
            return;
          }

          // We are hot reloading!
          this.version = version;

          // Update the state and bindings.
          this.trySubscribe();
          this.recomputeStateProps();
          this.recomputeDispatchProps();
          this.recomputeState();
        }
      }

      componentWillReceiveProps(nextProps) {
        if (!shallowEqual(nextProps, this.props)) {
          this.recomputeState(nextProps);
        }
      }

      componentWillUnmount() {
        this.tryUnsubscribe();
      }

      handleChange() {
        if (this.recomputeStateProps()) {
          this.recomputeState();
        }
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
                              {...this.state} />
        );
      }
    };
  };
}
