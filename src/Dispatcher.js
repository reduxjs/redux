import compose from './utils/compose';

export default class Dispatcher {
  constructor({ reducer, middleware }) {
    this.reducer = reducer;
    this.middleware = middleware;
    this.initialize();
  }

  initialize({ atom, subscriptions = [] } = {}) {
    this.atom = atom;
    this.subscriptions = subscriptions;
    this.dispatch({});
  }

  dispose() {
    const { atom, subscriptions } = this;
    delete this.atom;
    this.subscriptions = [];
    return { atom, subscriptions };
  }

  dispatch = (action) => {
    this.middleware(
      _action => this.reducer(this.getAtom(), this.dispatch)(
        nextAtom => this.setAtom(nextAtom)
      )(_action)
    )(action);
  }

  getAtom() {
    return this.atom;
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
