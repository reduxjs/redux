import createDispatcher from './createDispatcher';
import composeStores from './utils/composeStores';
import thunkMiddleware from './middleware/thunk';

export default class Redux {
  constructor(storeOrDispatcher, initialState) {
    let dispatcher;
    if (typeof storeOrDispatcher === 'object') {
      // A shortcut notation to use the default dispatcher
      dispatcher = createDispatcher(
        composeStores(storeOrDispatcher),
        getState => [thunkMiddleware(getState)]
      );
    } else {
      dispatcher = storeOrDispatcher;
    }

    this.state = initialState;
    this.listeners = [];
    this.replaceDispatcher(dispatcher);
  }

  getDispatcher() {
    return this.dispatcher;
  }

  replaceDispatcher(nextDispatcher) {
    this.dispatcher = nextDispatcher;
    this.dispatchFn = nextDispatcher(this.state, ::this.setState);
  }

  dispatch(action) {
    return this.dispatchFn(action);
  }

  getState() {
    return this.state;
  }

  setState(nextState) {
    this.state = nextState;
    this.listeners.forEach(listener => listener());
    return nextState;
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
