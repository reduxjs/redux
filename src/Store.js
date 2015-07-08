import invariant from 'invariant';
import isPlainObject from './utils/isPlainObject';

export default class Store {
  constructor(reducer, initialState) {
    invariant(
      typeof reducer === 'function',
      'Expected the reducer to be a function.'
    );

    this.state = initialState;
    this.listeners = [];
    this.replaceReducer(reducer);
  }

  getReducer() {
    return this.reducer;
  }

  replaceReducer(nextReducer) {
    this.reducer = nextReducer;
    this.dispatch({ type: '@@INIT' });
  }

  dispatch(action) {
    invariant(
      isPlainObject(action),
      'Actions must be plain objects. Use custom middleware for async actions.'
    );

    const { reducer } = this;
    this.state = reducer(this.state, action);
    this.listeners.forEach(listener => listener());
    return action;
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    const { listeners } = this;
    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
}
