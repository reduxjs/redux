import identity from 'lodash/utility/identity';
import shallowEqual from '../utils/shallowEqual';
import bindActionCreators from '../utils/bindActionCreators';


export default function createConnector(React) {
  const { Component, PropTypes } = React;

  return class Connector extends Component {
    static contextTypes = {
      redux: PropTypes.object.isRequired
    };

    static propTypes = {
      children: PropTypes.func.isRequired,
      select: PropTypes.func.isRequired,
      actionCreators: PropTypes.object
    };

    static defaultProps = {
      select: identity,
      actionCreators: {}
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

      this.unsubscribe = context.redux.subscribe(::this.handleChange);
      this.state = this.selectState({ context, props });
      this.boundActions = this.bindActionCreators(props.actionCreators, context.redux.dispatch);
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.select !== this.props.select) {
        // Force the state slice recalculation
        this.handleChange();
      }

      if (nextProps.actionCreators !== this.props.actionCreators) {
        this.boundActions = this.bindActionCreators(nextProps.actionCreators, this.context.redux.dispatch);
      }
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    handleChange() {
      this.setState(this.selectState());
    }

    selectState({ context, props } = this) {
      const state = context.redux.getState();
      const slice = props.select(state);
      return { slice };
    }

    bindActionCreators = (actionCreators, dispatch) => {
      return {
        actions: bindActionCreators(actionCreators, dispatch)
      };
    }

    render() {
      const { children } = this.props;
      const { slice } = this.state;
      const { redux: { dispatch } } = this.context;

      return children({ dispatch, ...slice, ...this.boundActions });
    }
  };
}
