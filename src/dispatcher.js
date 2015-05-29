import * as stores from './stores/index';
import * as actions from './actions/index';
import createDispatcher from './redux/createDispatcher';

const state = module.hot && module.hot.data && module.hot.data.state;
const dispatcher = createDispatcher(stores, actions, state);

module.hot.dispose((data) => {
  data.state = dispatcher.getState();
});

export default dispatcher;