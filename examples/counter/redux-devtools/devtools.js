export const ActionTypes = {
  PERFORM: 'PERFORM'
};

function lift(reducer) {
  const initialState = {
    appState: reducer(undefined, { type: '@@INIT' })
  };

  return function handleDevToolsAction(state = initialState, action) {
    switch (action.type) {
    case ActionTypes.PERFORM:
      return {
        ...state,
        appState: reducer(state.appState, action.action)
      };
    default:
      return state;
    }
  };
}

function unlift(store) {
  function getState() {
    return store.getState().appState;
  }

  function dispatch(action) {
    store.dispatch({
      type: ActionTypes.PERFORM,
      action
    });
  }

  return {
    ...store,
    dispatch,
    getState,
    getDevToolsStore() {
      return store;
    }
  };
}

export default function devtools() {
  // TODO: initial state
  return next => reducer => {
    const devToolsReducer = lift(reducer);
    const devToolsStore = next(devToolsReducer);
    const store = unlift(devToolsStore);

    return store;
  };
}
