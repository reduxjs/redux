/* @flow */

import createDispatcher from './createDispatcher';
import composeStores from './utils/composeStores';
import thunkMiddleware from './middleware/thunk';

type Dispatch = (action: mixed) => mixed;
type Dispatcher = (state: mixed, setState: (nextState: mixed) => mixed) => Dispatch;

export default class Redux {
  state: mixed;
  listeners: Array<() => mixed>;
  dispatcher: Dispatcher;
  dispatchFn: Dispatch;

  constructor(dispatcher: Dispatcher | Object, initialState: mixed): void {
    if (typeof dispatcher === 'object') {
      // A shortcut notation to use the default dispatcher
      dispatcher = createDispatcher(
        composeStores(dispatcher),
        getState => [thunkMiddleware(getState)]
      );
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

  dispatch(action: mixed): mixed {
    return this.dispatchFn(action);
  }

  getState(): mixed {
    return this.state;
  }

  setState(nextState: mixed): mixed {
    this.state = nextState;
    this.listeners.forEach(listener => listener());
    return nextState;
  }

  subscribe(listener: () => mixed): () => mixed {
    var { listeners } = this;
    listeners.push(listener);

    return function unsubscribe () {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
}
