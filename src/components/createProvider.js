import createStoreShape from '../utils/createStoreShape';

function isUsingOwnerContext(React) {
  const { version } = React;
  if (typeof version !== 'string') {
    return true;
  }

  const sections = version.split('.');
  const major = parseInt(sections[0], 10);
  const minor = parseInt(sections[1], 10);

  return major === 0 && minor === 13;
}

export default function createProvider(React) {
  const { Component, PropTypes, Children } = React;
  const storeShape = createStoreShape(PropTypes);
  const requireFunctionChild = isUsingOwnerContext(React);

  let didWarn = false;
  function warnAboutFunction() {
    if (didWarn || requireFunctionChild) {
      return;
    }

    didWarn = true;
    console.error( // eslint-disable-line no-console
      'With React 0.14 and later versions, you no longer need to ' +
      'wrap <Provider> child into a function.'
    );
  }
  function warnAboutElement() {
    if (didWarn || !requireFunctionChild) {
      return;
    }

    didWarn = true;
    console.error( // eslint-disable-line no-console
      'With React 0.13, you need to ' +
      'wrap <Provider> child into a function. ' +
      'This restriction will be removed with React 0.14.'
    );
  }

  return class Provider extends Component {
    static childContextTypes = {
      store: storeShape.isRequired
    };

    static propTypes = {
      store: storeShape.isRequired,
      children: (requireFunctionChild ?
        PropTypes.func :
        PropTypes.element
      ).isRequired
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
      let { children } = this.props;

      if (typeof children === 'function') {
        warnAboutFunction();
        children = children();
      } else {
        warnAboutElement();
      }

      return Children.only(children);
    }
  };
}
