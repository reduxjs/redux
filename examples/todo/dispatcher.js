import * as stores from './stores/index';
import * as actions from './actions/index';
import { createDispatcher } from 'redux';

const dispatcher =
  module.hot && module.hot.data && module.hot.data.dispatcher ||
  createDispatcher();

dispatcher.receive(stores, actions);

if (module.hot) {
  module.hot.dispose(data => {
    data.dispatcher = dispatcher;
  });
}

export default dispatcher;
