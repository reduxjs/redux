import Dispatcher from './Dispatcher';

export default function createDispatcher(...args) {
  const dispatcher = new Dispatcher(...args);

  return {
    subscribe: ::dispatcher.subscribe,
    perform: ::dispatcher.perform,
    hydrate: ::dispatcher.hydrate,
    dehydrate: ::dispatcher.dehydrate,
  };
}
