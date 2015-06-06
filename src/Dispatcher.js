function dispatch(store, atom, action) {
  return store(atom, action);
}

export default class Dispatcher {
  constructor(store, atom) {
    this.store = store;
    this.atom = atom;
    this.subscriptions = [];
    this.dispatch({});
  }

  receive(dispatcher) {
    this.atom = dispatcher.atom;
    this.subscriptions = dispatcher.subscriptions;
    this.dispatch({});
  }

  dispatch(action) {
    const nextAtom = dispatch(this.store, this.atom, action);
    this.setAtom(nextAtom);
  }

  setAtom(atom) {
    this.atom = atom;
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

  dispose() {
    this.atom = undefined;
    this.subscriptions = [];
  }
}
