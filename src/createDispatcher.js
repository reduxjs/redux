export default function createDispatcher(store) {
  return function dispatcher(initialState, setState) {
    let state = store(initialState, {});
    setState(state);

    function dispatchSync(action) {
      state = store(state, action);
      setState(state);
      return action;
    }

    function dispatch(action) {
      return typeof action === 'function' ?
        action(dispatch, state) :
        dispatchSync(action);
    }

    return dispatch;
  };
}
