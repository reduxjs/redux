import createDispatcher from './createDispatcher';
import composeStores from './utils/composeStores';
import thunkMiddleware from './middleware/thunk';
import identity from 'lodash/utility/identity';

export default class Redux {
  constructor(dispatcher, initialState, prepareState = identity) {
    if (typeof dispatcher === 'object') {
      // A shortcut notation to use the default dispatcher
      dispatcher = createDispatcher(
        composeStores(dispatcher),
        ({ getState }) => [thunkMiddleware(getState)]
      );
    }

    this.state = initialState;
    this.prepareState = prepareState;
    this.listeners = [];
    this.replaceDispatcher(dispatcher);
  }

  getDispatcher() {
    return this.dispatcher;
  }

  replaceDispatcher(nextDispatcher) {
    this.dispatcher = nextDispatcher;
    this.dispatchFn = nextDispatcher({
      getState: ::this.getRawState,
      setState: ::this.setState
    });
    this.dispatch({});
  }

  dispatch(action) {
    return this.dispatchFn(action);
  }

  getRawState() {
    return this.state;
  }

  getState() {
    return this.prepareState(this.state);
  }

  setState(nextState) {
    this.state = nextState;
    this.listeners.forEach(listener => listener());
    return nextState;
  }

  subscribe(listener) {
    const { listeners } = this;
    listeners.push(listener);

    return function unsubscribe () {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
}
