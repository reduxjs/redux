export const ActionTypes = {
  PERFORM_ACTION: 'PERFORM_ACTION',
  RESET: 'RESET',
  ROLLBACK: 'ROLLBACK',
  COMMIT: 'COMMIT'
};

const INIT_ACTION = {
  type: '@@INIT'
};

function last(arr) {
  return arr[arr.length - 1];
}

/**
 * Computes the next entry in the log by applying an action.
 */
function computeNextEntry(reducer, action, state, error) {
  if (error) {
    return {
      state,
      error: 'Interrupted by an error up the chain'
    };
  }

  try {
    state = reducer(state, action);
  } catch (err) {
    error = err.toString();
  }

  return { state, error };
}

/**
 * Runs the reducer on all actions to get a fresh computation log.
 * It's probably a good idea to do this only if the code has changed,
 * but until we have some tests we'll just do it every time an action fires.
 */
function recompute(reducer, committedState, stagedActions) {
  const computations = [];

  for (let i = 0; i < stagedActions.length; i++) {
    const action = stagedActions[i];

    const previousEntry = computations[i - 1];
    const previousState = previousEntry ? previousEntry.state : committedState;
    const previousError = previousEntry ? previousEntry.error : undefined;

    const entry = computeNextEntry(reducer, action, previousState, previousError);
    computations.push(entry);
  }

  return computations;
}


/**
 * Lifts the app state reducer into a DevTools state reducer.
 */
function liftReducer(reducer, initialState) {
  const initialLiftedState = {
    committedState: initialState,
    stagedActions: [INIT_ACTION]
  };

  /**
   * Manages how the DevTools actions modify the DevTools state.
   */
  return function liftedReducer(liftedState = initialLiftedState, liftedAction) {
    let { committedState, stagedActions, computations } = liftedState;

    switch (liftedAction.type) {
    case ActionTypes.RESET:
      stagedActions = [INIT_ACTION];
      committedState = initialState;
      break;
    case ActionTypes.COMMIT:
      stagedActions = [INIT_ACTION];
      committedState = last(computations).state;
      break;
    case ActionTypes.ROLLBACK:
      stagedActions = [INIT_ACTION];
      break;
    case ActionTypes.PERFORM_ACTION:
      stagedActions = [...stagedActions, liftedAction.action];
      break;
    }

    computations = recompute(reducer, committedState, stagedActions);
    return { committedState, stagedActions, computations };
  };
}

/**
 * Lifts an app action to a DevTools action.
 */
function liftAction(action) {
  const liftedAction = { type: ActionTypes.PERFORM_ACTION, action };
  return liftedAction;
}

/**
 * Unlifts the DevTools state to the app state.
 */
function unliftState(liftedState) {
  const { computations } = liftedState;
  const { state } = last(computations);
  return state;
}

/**
 * Unlifts the DevTools store to act like the app's store.
 */
function unliftStore(liftedStore) {
  const store = {
    ...liftedStore,
    dispatch(action) {
      liftedStore.dispatch(liftAction(action));
    },
    getState() {
      return unliftState(liftedStore.getState());
    },
    getDevToolsStore() {
      return liftedStore;
    }
  };
  return store;
}

/**
 * Redux DevTools middleware.
 */
export default function devTools() {
  return next => (reducer, initialState) => {
    const liftedReducer = liftReducer(reducer, initialState);
    const liftedStore = next(liftedReducer);
    const store = unliftStore(liftedStore);
    return store;
  };
}
