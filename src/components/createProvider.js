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

  let didWarnAboutChild = false;
  function warnAboutFunctionChild() {
    if (didWarnAboutChild || requireFunctionChild) {
      return;
    }

    didWarnAboutChild = true;
    console.error( // eslint-disable-line no-console
      'With React 0.14 and later versions, you no longer need to ' +
      'wrap <Provider> child into a function.'
    );
  }
  function warnAboutElementChild() {
    if (didWarnAboutChild || !requireFunctionChild) {
      return;
    }

    didWarnAboutChild = true;
    console.error( // eslint-disable-line no-console
      'With React 0.13, you need to ' +
      'wrap <Provider> child into a function. ' +
      'This restriction will be removed with React 0.14.'
    );
  }

  let didWarnAboutReceivingStore = false;
  function warnAboutReceivingStore() {
    if (didWarnAboutReceivingStore) {
      return;
    }

    didWarnAboutReceivingStore = true;
    console.error( // eslint-disable-line no-console
      '<Provider> does not support changing `store` on the fly. ' +
      'It is most likely that you see this error because you updated to ' +
      'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' +
      'automatically. See https://github.com/rackt/react-redux/releases/' +
      'tag/v2.0.0 for the migration instructions.'
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
      return { store: this.store };
    }

    constructor(props, context) {
      super(props, context);
      this.store = props.store;
    }

    componentWillReceiveProps(nextProps) {
      const { store } = this;
      const { store: nextStore } = nextProps;

      if (store !== nextStore) {
        warnAboutReceivingStore();
      }
    }

    render() {
      let { children } = this.props;

      if (typeof children === 'function') {
        warnAboutFunctionChild();
        children = children();
      } else {
        warnAboutElementChild();
      }

      return Children.only(children);
    }
  };
}
