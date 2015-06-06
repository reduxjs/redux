function dispatch(store, atom, action) {
  return store(atom, action);
}

export default class Dispatcher {
  constructor(store) {
    this.store = store;
    this.hydrate();
  }

  hydrate({ atom, subscriptions = [] } = {}) {
    this.atom = atom;
    this.subscriptions = subscriptions;
    this.dispatch({});
  }

  dehydrate() {
    const { atom, subscriptions } = this;
    delete this.atom;
    this.subscriptions = [];
    return { atom, subscriptions };
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
}
