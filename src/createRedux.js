import Redux from './Redux';

export default function createRedux(...args) {
  const redux = new Redux(...args);

  return {
    subscribe: ::redux.subscribe,
    dispatch: ::redux.dispatch,
    getState: ::redux.getState,
    getDispatcher: ::redux.getDispatcher,
    replaceDispatcher: ::redux.replaceDispatcher
  };
}
