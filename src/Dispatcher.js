import compose from './utils/compose';
import storeReducer from './storeReducer';

export default class Dispatcher {
  constructor({ store, reducer = storeReducer, middleware } = {}) {
    this.store = store;
    this.middleware = compose(...middleware);
    this.initialize({ reducer });
  }

  initialize({ atom, subscriptions = [], reducer } = {}) {
    this.atom = atom;
    this.subscriptions = subscriptions;
    this.reducer = reducer;
    this.dispatch({});
  }

  dispose() {
    const { atom, subscriptions, reducer } = this;
    this.subscriptions = [];
    return { atom, subscriptions, reducer };
  }

  dispatch(action) {
    this.middleware(
      _action => this.reducer(this.store)(this.getAtom(), ::this.dispatch)(
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
