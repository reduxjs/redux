export const ActionTypes = {
  PERFORM_ACTION: 'PERFORM_ACTION',
  RESET: 'RESET'
};

const INIT_ACTION = {
  type: '@@INIT'
};

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
function recompute(reducer, liftedState) {
  const { initialState, actions } = liftedState;
  const computations = [];

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];

    const previousEntry = computations[i - 1];
    const previousState = previousEntry ? previousEntry.state : undefined;
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
    initialState,
    actions: [INIT_ACTION]
  };

  /**
   * Manages how the DevTools actions modify the DevTools state.
   */
  return function liftedReducer(liftedState = initialLiftedState, liftedAction) {
    switch (liftedAction.type) {
    case ActionTypes.RESET:
      liftedState = initialLiftedState;
      break;
    case ActionTypes.PERFORM_ACTION:
      const { actions } = liftedState;
      const { action } = liftedAction;
      liftedState = {
        ...liftedState,
        actions: [...actions, action]
      };
      break;
    }

    return {
      ...liftedState,
      computations: recompute(reducer, liftedState)
    };
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
  const lastComputation = computations[computations.length - 1];
  const { state } = lastComputation;
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
