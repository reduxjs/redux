import Dispatcher from './Dispatcher';

export default function createDispatcher(...args) {
  const dispatcher = new Dispatcher(...args);

  return {
    subscribe: ::dispatcher.subscribe,
    dispatch: ::dispatcher.dispatch,
    getAtom: ::dispatcher.getAtom,
    setAtom: ::dispatcher.setAtom,
    initialize: ::dispatcher.initialize,
    dispose: ::dispatcher.dispose
  };
}
