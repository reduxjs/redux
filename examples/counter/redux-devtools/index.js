const ActionTypes = {
  PERFORM_ACTION: 'PERFORM_ACTION',
  RESET: 'RESET',
  ROLLBACK: 'ROLLBACK',
  COMMIT: 'COMMIT',
  SWEEP: 'SWEEP',
  TOGGLE_ACTION: 'TOGGLE_ACTION'
};

const INIT_ACTION = {
  type: '@@INIT'
};

function last(arr) {
  return arr[arr.length - 1];
}

function toggle(obj, key) {
  obj = { ...obj };
  if (obj[key]) {
    delete obj[key];
  } else {
    obj[key] = true;
  }
  return obj;
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
function recomputeStates(reducer, committedState, stagedActions, skippedActions) {
  const computedStates = [];

  for (let i = 0; i < stagedActions.length; i++) {
    const action = stagedActions[i];

    const previousEntry = computedStates[i - 1];
    const previousState = previousEntry ? previousEntry.state : committedState;
    const previousError = previousEntry ? previousEntry.error : undefined;

    const shouldSkip = Boolean(skippedActions[i]);
    const entry = shouldSkip ?
      previousEntry :
      computeNextEntry(reducer, action, previousState, previousError);

    computedStates.push(entry);
  }

  return computedStates;
}


/**
 * Lifts the app state reducer into a DevTools state reducer.
 */
function liftReducer(reducer, initialState) {
  const initialLiftedState = {
    committedState: initialState,
    stagedActions: [INIT_ACTION],
    skippedActions: {}
  };

  /**
   * Manages how the DevTools actions modify the DevTools state.
   */
  return function liftedReducer(liftedState = initialLiftedState, liftedAction) {
    let {
      committedState,
      stagedActions,
      skippedActions,
      computedStates
    } = liftedState;

    switch (liftedAction.type) {
    case ActionTypes.RESET:
      committedState = initialState;
      stagedActions = [INIT_ACTION];
      skippedActions = {};
      break;
    case ActionTypes.COMMIT:
      committedState = last(computedStates).state;
      stagedActions = [INIT_ACTION];
      skippedActions = {};
      break;
    case ActionTypes.ROLLBACK:
      stagedActions = [INIT_ACTION];
      skippedActions = {};
      break;
    case ActionTypes.TOGGLE_ACTION:
      const { index } = liftedAction;
      skippedActions = toggle(skippedActions, index);
      break;
    case ActionTypes.SWEEP:
      stagedActions = stagedActions.filter((_, i) => !skippedActions[i]);
      skippedActions = {};
      break;
    case ActionTypes.PERFORM_ACTION:
      const { action } = liftedAction;
      stagedActions = [...stagedActions, action];
      break;
    }

    computedStates = recomputeStates(
      reducer,
      committedState,
      stagedActions,
      skippedActions
    );

    return {
      committedState,
      stagedActions,
      skippedActions,
      computedStates
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
  const { computedStates } = liftedState;
  const { state } = last(computedStates);
  return state;
}

/**
 * Unlifts the DevTools store to act like the app's store.
 */
function unliftStore(liftedStore) {
  return {
    ...liftedStore,
    devToolsStore: liftedStore,
    dispatch(action) {
      liftedStore.dispatch(liftAction(action));
      return action;
    },
    getState() {
      return unliftState(liftedStore.getState());
    }
  };
}

/**
 * Action creators to change the DevTools state.
 */
export const ActionCreators = {
  reset() {
    return { type: ActionTypes.RESET };
  },
  rollback() {
    return { type: ActionTypes.ROLLBACK };
  },
  commit() {
    return { type: ActionTypes.COMMIT };
  },
  sweep() {
    return { type: ActionTypes.SWEEP };
  },
  toggleAction(index) {
    return { type: ActionTypes.TOGGLE_ACTION, index };
  }
};

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
