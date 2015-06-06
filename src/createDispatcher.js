import Dispatcher from './Dispatcher';

export default function createDispatcher(...args) {
  return new Dispatcher(...args);
}
