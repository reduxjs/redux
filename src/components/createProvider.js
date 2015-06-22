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
      const { redux } = this.state;
      const { redux: nextRedux } = nextProps;

      if (redux !== nextRedux) {
        const nextReducer = nextRedux.getReducer();
        redux.replaceReducer(nextReducer);
      }
    }

    render() {
      const { children } = this.props;
      return children();
    }
  };
}
