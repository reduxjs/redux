import createStoreShape from '../utils/createStoreShape';
import getDisplayName from '../utils/getDisplayName';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import wrapActionCreators from '../utils/wrapActionCreators';
import invariant from 'invariant';

const emptySelector = () => ({});

const emptyBinder = () => ({});

const identityMerge = (slice, actionsCreators, props) => ({...slice, ...actionsCreators, ...props});


export default function createConnectWrapper(React) {
  const { Component, PropTypes } = React;
  const storeShape = createStoreShape(PropTypes);

  return function connect(select, bindActionCreators, merge) {

    const subscribing = select ? true : false;

    select = select || emptySelector;

    bindActionCreators = bindActionCreators || emptyBinder;

    if (isPlainObject(bindActionCreators)) {
      bindActionCreators = wrapActionCreators(bindActionCreators);
    }

    merge = merge || identityMerge;

    return DecoratedComponent => class ConnectWrapper extends Component {
      static displayName = `ConnectWrapper(${getDisplayName(DecoratedComponent)})`;
      static DecoratedComponent = DecoratedComponent;

      static contextTypes = {
        store: storeShape.isRequired
      };

      componentWillReceiveProps(nextProps) {
        console.log('recieving props', this.props, nextProps)
      }

      shouldComponentUpdate(nextProps, nextState) {
        console.log('shallowEqual of props', shallowEqual(this.props, nextProps), this.props, nextProps)
        return (this.subscribed && !this.isSliceEqual(this.state.slice, nextState.slice)) ||
               !shallowEqual(this.props, nextProps);
      }

      isSliceEqual(slice, nextSlice) {
        const isRefEqual = slice === nextSlice;
        if (isRefEqual) {
          return true;
        } else if (typeof slice !== 'object' || typeof nextSlice !== 'object') {
          return isRefEqual;
        }
        return shallowEqual(slice, nextSlice);
      }

      constructor(props, context) {
        super(props, context);
        this.state = {
          ...this.selectState(props, context),
          ...this.bindActionCreators(context),
        };
      }

      componentWillMount() {
        console.log('will mount', this.props)
      }

      componentDidMount() {
        console.log('mounted', this.props)
        if (subscribing) {
          this.subscribed = true;
          this.unsubscribe = this.context.store.subscribe(::this.handleChange);
        }
      }

      componentWillUnmount() {
        if (subscribing) {
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
        const slice = select(state);

        invariant(
          isPlainObject(slice),
          'The return value of `select` prop must be an object. Instead received %s.',
          slice
        );

        return { slice };
      }

      bindActionCreators(context = this.context) {
        const { dispatch } = context.store;
        const actionCreators = bindActionCreators(dispatch);

        invariant(
          isPlainObject(actionCreators),
          'The return value of `bindActionCreators` prop must be an object. Instead received %s.',
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

        console.log('merging with ', merged)

        return merged;
      }

      render() {
        return <DecoratedComponent {...this.merge()} />;
      }
    };
  };
} 
