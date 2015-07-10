/* @flow */

import invariant from 'invariant';
import isPlainObject from './utils/isPlainObject';

import type { State, Action, Reducer } from './types';

export default class Store {
  state: State;
  reducer: Reducer;
  listeners: Array<Function>;

  constructor(reducer: Reducer, initialState: State): void {
    invariant(
      typeof reducer === 'function',
      'Expected the reducer to be a function.'
    );

    this.state = initialState;
    this.listeners = [];
    this.replaceReducer(reducer);
  }

  getReducer(): Reducer {
    return this.reducer;
  }

  replaceReducer(nextReducer: Reducer): void {
    this.reducer = nextReducer;
    this.dispatch({ type: '@@INIT' });
  }

  dispatch(action: Action): Action {
    invariant(
      isPlainObject(action),
      'Actions must be plain objects. Use custom middleware for async actions.'
    );

    var { reducer } = this;
    this.state = reducer(this.state, action);
    this.listeners.forEach(listener => listener());
    return action;
  }

  getState(): State {
    return this.state;
  }

  subscribe(listener: Function): Function {
    var { listeners } = this;
    listeners.push(listener);

    return function unsubscribe() {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
}
