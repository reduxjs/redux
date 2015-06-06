import { Component, PropTypes } from 'react';

export default function dispatch(store, atom, action) {
  return store(atom, action);
}

export default class Dispatcher extends Component {
  static propTypes = {
    store: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired
  };

  static childContextTypes = {
    redux: PropTypes.object.isRequired
  };

  getChildContext() {
    return { redux: this };
  }

  constructor(props, context) {
    super(props, context);

    this.subscriptions = [];
    this.emitChange = this.emitChange.bind(this);
    this.dispatch = this.dispatch.bind(this);

    const initialAtom = dispatch(props.store, undefined, {});
    this.setAtom(initialAtom);
  }

  dispatch(action) {
    const nextAtom = dispatch(this.props.store, this.atom, action);
    this.setAtom(nextAtom);
  }

  setAtom(atom) {
    this.atom = atom;
    if (this.state) {
      this.setState({ atom });
    } else {
      this.state = { atom };
    }
    this.emitChange();
  }

  subscribe(listener) {
    this.subscriptions.push(listener);
    listener(this.atom);

    return () => {
      const index = this.subscriptions.indexOf(listener);
      this.subscriptions.splice(index, 1);
    };
  }

  emitChange() {
    const { atom, subscriptions } = this;
    subscriptions.forEach(listener => listener(atom));
  }

  render() {
    const { children } = this.props;
    return children();
  }
}
