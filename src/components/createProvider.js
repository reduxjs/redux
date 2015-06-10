export default function createProvider(React) {
  const { Component, PropTypes } = React;

  const reduxShape = PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  });

  return class Provider extends Component {
    static propTypes = {
      redux: reduxShape.isRequired,
      children: PropTypes.func.isRequired
    };

    static childContextTypes = {
      redux: reduxShape.isRequired
    };

    getChildContext() {
      return { redux: this.state.redux };
    }

    constructor(props, context) {
      super(props, context);
      this.state = { redux: props.redux };
    }

    componentWillReceiveProps(nextProps) {
      const nextDispatcher = nextProps.redux.getDispatcher();
      this.state.redux.replaceDispatcher(nextDispatcher);
    }

    render() {
      const { children } = this.props;
      return children();
    }
  };
}
