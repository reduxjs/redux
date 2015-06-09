function createDefaultReducer(store) {
  return store;
}

const REPLAY_STATE = Symbol('Replay State');
function createReplayingReducer(store) {
  return (state = {}, action) => {
    let {
      [REPLAY_STATE]: { actions = [], initialState = state } = {},
      ...appState
    } = state;

    actions = [...actions, action];
    appState = actions.reduce(store, initialState);

    return {
      [REPLAY_STATE]: { actions, initialState },
      ...appState
    }
  };
}

function createDefaultScheduler(dispatch, getState) {
  function schedule(action) {
    if (typeof action === 'function') {
      return action(schedule, getState());
    } else {
      return dispatch(action);
    }
  }

  return schedule;
}

export default function createDispatcher(store, {
  log = false,
  replay = false
}: options = {}) {
  return function dispatcher(initialState, setState) {
    const reduce = replay ?
      createReplayingReducer(store) :
      createDefaultReducer(store);

    if (replay) {
      console.debug('---- Replay Mode ----');
    } else {
      console.debug('---- Normal Mode ----');
    }
    console.debug('Initial state:', initialState);

    let state = reduce(initialState, {});
    setState(state);

    function dispatch(action) {
      if (log) {
        console.groupCollapsed(replay ? '[replay]' : '[normal]', action);
        console.log('State before:', state);
      }

      state = reduce(state, action);
      setState(state);

      if (log) {
        console.log('State after:', state);
        console.groupEnd(replay ? '[replay]' : '[normal]', action);
      }

      return action;
    }

    return createDefaultScheduler(dispatch, () => state);
  };
}
