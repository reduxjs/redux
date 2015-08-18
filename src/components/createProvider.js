import createStoreShape from '../utils/createStoreShape';

export default function createProvider(React) {
  const { Component, PropTypes } = React;
  const storeShape = createStoreShape(PropTypes);

  return class Provider extends Component {
    static childContextTypes = {
      store: storeShape.isRequired
    };

    static propTypes = {
      children: PropTypes.func.isRequired,
      store: storeShape.isRequired
    };

    getChildContext() {
      return { store: this.state.store };
    }

    constructor(props, context) {
      super(props, context);
      this.state = { store: props.store };
    }

    componentWillReceiveProps(nextProps) {
      const { store } = this.state;
      const { store: nextStore } = nextProps;

      if (store !== nextStore) {
        const nextReducer = nextStore.getReducer();
        store.replaceReducer(nextReducer);
      }
    }

    render() {
      const { children } = this.props;
      return children();
    }
  };
}
