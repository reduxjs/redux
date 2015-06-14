/* @flow */

import createDispatcher from './createDispatcher';
import composeStores from './utils/composeStores';
import thunkMiddleware from './middleware/thunk';

import { State, Action, Dispatch, Dispatcher } from './types';

export default class Redux {
  state: State;
  listeners: Function[];
  dispatcher: Dispatcher;
  dispatchFn: Dispatch;

  constructor(dispatcher: Dispatcher, initialState: State): void {
    if (typeof dispatcher === 'object') {
      // A shortcut notation to use the default dispatcher
      dispatcher = (createDispatcher(
        composeStores(dispatcher),
        getState => [thunkMiddleware(getState)]
      ));
    }

    this.state = initialState;
    this.listeners = [];
    this.replaceDispatcher(dispatcher);
  }

  getDispatcher(): Dispatcher {
    return this.dispatcher;
  }

  replaceDispatcher(nextDispatcher: Dispatcher): void {
    this.dispatcher = nextDispatcher;
    this.dispatchFn = nextDispatcher(this.state, this.setState.bind(this));
  }

  dispatch(action: Action): any {
    return this.dispatchFn(action);
  }

  getState(): State {
    return this.state;
  }

  setState(nextState: State): State {
    this.state = nextState;
    this.listeners.forEach(listener => listener());
    return nextState;
  }

  subscribe(listener: Function): () => void {
    var { listeners } = this;
    listeners.push(listener);

    return function unsubscribe() {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
}
