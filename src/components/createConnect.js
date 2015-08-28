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
    const shouldUpdateStateProps = finalMapStateToProps.length > 1;
    const shouldUpdateDispatchProps = finalMapDispatchToProps.length > 1;

    // Helps track hot reloading.
    const version = nextVersion++;

    function computeStateProps(store, props) {
      const state = store.getState();
      const stateProps = shouldUpdateStateProps ?
        finalMapStateToProps(state, props) :
        finalMapStateToProps(state);

      invariant(
        isPlainObject(stateProps),
        '`mapStateToProps` must return an object. Instead received %s.',
        stateProps
      );
      return stateProps;
    }

    function computeDispatchProps(store, props) {
      const { dispatch } = store;
      const dispatchProps = shouldUpdateDispatchProps ?
        finalMapDispatchToProps(dispatch, props) :
        finalMapDispatchToProps(dispatch);

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

        static propTypes = {
          store: storeShape
        };

        shouldComponentUpdate(nextProps, nextState) {
          return !shallowEqual(this.state.props, nextState.props);
        }

        constructor(props, context) {
          super(props, context);
          this.version = version;
          this.store = props.store || context.store;

          invariant(this.store,
            `Could not find "store" in either the context or ` +
            `props of "${this.constructor.displayName}". ` +
            `Either wrap the root component in a <Provider>, ` +
            `or explicitly pass "store" as a prop to "${this.constructor.displayName}".`
          );

          this.stateProps = computeStateProps(this.store, props);
          this.dispatchProps = computeDispatchProps(this.store, props);
          this.state = {
            props: this.computeNextState()
          };
        }

        computeNextState(props = this.props) {
          return computeNextState(
            this.stateProps,
            this.dispatchProps,
            props
          );
        }

        updateStateProps(props = this.props) {
          const nextStateProps = computeStateProps(this.store, props);
          if (shallowEqual(nextStateProps, this.stateProps)) {
            return false;
          }

          this.stateProps = nextStateProps;
          return true;
        }

        updateDispatchProps(props = this.props) {
          const nextDispatchProps = computeDispatchProps(this.store, props);
          if (shallowEqual(nextDispatchProps, this.dispatchProps)) {
            return false;
          }

          this.dispatchProps = nextDispatchProps;
          return true;
        }

        updateState(props = this.props) {
          const nextState = this.computeNextState(props);
          if (!shallowEqual(nextState, this.state.props)) {
            this.setState({
              props: nextState
            });
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
            if (shouldUpdateStateProps) {
              this.updateStateProps(nextProps);
            }

            if (shouldUpdateDispatchProps) {
              this.updateDispatchProps(nextProps);
            }

            this.updateState(nextProps);
          }
        }

        componentWillUnmount() {
          this.tryUnsubscribe();
        }

        handleChange() {
          if (this.updateStateProps()) {
            this.updateState();
          }
        }

        getWrappedInstance() {
          return this.refs.wrappedInstance;
        }

        render() {
          return (
            <WrappedComponent ref='wrappedInstance'
                              {...this.state.props} />
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
        __DEV__ // eslint-disable-line no-undef
      ) {
        Connect.prototype.componentWillUpdate = function componentWillUpdate() {
          if (this.version === version) {
            return;
          }

          // We are hot reloading!
          this.version = version;

          // Update the state and bindings.
          this.trySubscribe();
          this.updateStateProps();
          this.updateDispatchProps();
          this.updateState();
        };
      }

      return Connect;
    };
  };
}
