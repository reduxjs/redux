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

    function computeStateProps(store) {
      const state = store.getState();
      const stateProps = finalMapStateToProps(state);
      invariant(
        isPlainObject(stateProps),
        '`mapStateToProps` must return an object. Instead received %s.',
        stateProps
      );
      return stateProps;
    }

    function computeDispatchProps(store) {
      const { dispatch } = store;
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

    return function wrapWithConnect(WrappedComponent) {
      class Connect extends Component {
        static displayName = `Connect(${getDisplayName(WrappedComponent)})`;
        static WrappedComponent = WrappedComponent;

        static contextTypes = {
          store: storeShape
        };

        shouldComponentUpdate(nextProps, nextState) {
          return !shallowEqual(this.state, nextState);
        }

        constructor(props, context) {
          super(props, context);
          this.version = version;
          this.store = props.store || context.store;

          invariant(this.store, '`store` must be passed in via the context or props');

          this.stateProps = computeStateProps(this.store);
          this.dispatchProps = computeDispatchProps(this.store);
          this.state = this.computeNextState();
        }

        recomputeStateProps() {
          const nextStateProps = computeStateProps(this.store);
          if (shallowEqual(nextStateProps, this.stateProps)) {
            return false;
          }

          this.stateProps = nextStateProps;
          return true;
        }

        recomputeDispatchProps() {
          const nextDispatchProps = computeDispatchProps(this.store);
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
            this.unsubscribe = this.store.subscribe(::this.handleChange);
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

        getWrappedInstance() {
          return this.refs.wrappedInstance;
        }

        render() {
          return (
            <WrappedComponent ref='wrappedInstance'
                              {...this.state} />
          );
        }
      }

      if ((
        // Node-like CommonJS environments (Browserify, Webpack)
        typeof process !== 'undefined' &&
        typeof process.env !== 'undefined' &&
        process.env.NODE_ENV !== 'production'
       ) ||
        // React Native
        typeof __DEV__ !== 'undefined' &&
        __DEV__ //eslint-disable-line no-undef
      ) {
        Connect.prototype.componentWillUpdate = function componentWillUpdate() {
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
        };
      }

      return Connect;
    };
  };
}
