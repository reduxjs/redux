import Dispatcher from './Dispatcher';

export default function createDispatcher(...args) {
  const dispatcher = new Dispatcher(...args);

  return {
    subscribe: ::dispatcher.subscribe,
    perform: ::dispatcher.perform,
    getAtom: ::dispatcher.getAtom,
    setAtom: ::dispatcher.setAtom,
    initialize: ::dispatcher.initialize,
    dispose: ::dispatcher.dispose
  };
}
