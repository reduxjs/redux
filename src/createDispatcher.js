function mapValues(obj, fn) {
  const result = {};
  Object.keys(obj).forEach(key =>
    result[key] = fn(obj[key], key)
  );
  return result;
}

// An action dispatched to init store state
const BOOTSTRAP_STORE = {
  type: 'BOOTSTRAP_STORE'
};

export default function createDispatcher() {
  let observers = {};
  let stores = {};
  let actionCreators = {};
  let currentState = {};
  let currentTransaction = null;
  let committedState = {};

  // To compute the next state, combine the next states of every store
  function computeNextState(state, action) {
    return mapValues(stores,
      (store, key) => store(state[key], action)
    );
  }

  // Notify observers about the changed stores
  function emitChange(changedKeys) {
    if (!changedKeys.length) {
      return;
    }

    // Gather the affected observers
    const notifyObservers = [];
    changedKeys.forEach(key => {
      observers[key].forEach(o => {
        if (notifyObservers.indexOf(o) === -1) {
          notifyObservers.push(o);
        }
      });
    });

    // Emit change
    notifyObservers.forEach(o => o());
  }

  // Update state and emit change if needed
  function updateState(nextState) {
    // Swap the state
    const previousState = currentState;
    currentState = nextState;

    // Notify the observers
    const changedKeys = Object.keys(currentState).filter(key =>
      currentState[key] !== previousState[key]
    );
    emitChange(changedKeys);
  }

  // Reassign the current state on each dispatch
  function dispatch(action) {
    if (typeof action.type !== 'string') {
      throw new Error('Action type must be a string.');
    }

    const nextState = computeNextState(currentState, action);
    updateState(nextState);
  }

  // Provide subscription and unsubscription
  function observeStores(pickStores, onChange) {
    // Map store keys into the desired shape
    const observedKeys = pickStores(
      mapValues(stores, (store, key) => key)
    );

    // Emit the state update in the desired shape
    function handleChange() {
      const observedState = mapValues(observedKeys, key => currentState[key]);
      onChange(observedState);
    }

    // Synchronously emit the initial value
    handleChange();

    // Register the observer for each relevant key
    mapValues(observedKeys, key => {
      observers[key].push(handleChange);
    });

    // Let it unregister when the time comes
    return () => {
      mapValues(observedKeys, key => {
        const index = observers[key].indexOf(handleChange);
        observers[key].splice(index, 1);
      });
    };
  }

  // Dispatch in the context of current transaction
  function dispatchInTransaction(action) {
    if (currentTransaction) {
      currentTransaction.push(action);
    }
    dispatch(action);
  }

  // Bind action creator to the dispatcher
  function bindAction(actionCreator) {
    return function dispatchAction(...args) {
      const action = actionCreator(...args);
      if (typeof action === 'function') {
        // Async action creator
        action(dispatchInTransaction);
      } else {
        // Sync action creator
        dispatchInTransaction(action);
      }
    };
  }

  // Provide dispatching
  function bindActions(pickActions) {
    return mapValues(pickActions(actionCreators), bindAction);
  }

  // Provide a way to receive new stores and actions
  function receive(nextStores, nextActionCreators) {
    stores = nextStores;
    actionCreators = nextActionCreators;

    // Merge the observers
    observers = mapValues(stores,
      (store, key) => observers[key] || []
    );

    // Dispatch to initialize stores
    if (currentTransaction) {
      updateState(committedState);
      currentTransaction.forEach(dispatch);
    } else {
      dispatch(BOOTSTRAP_STORE);
    }
  }

  // Support state transactions hooks for devtools.
  // Useful for hot-reloading some actions on top of a "committed" state.
  function transact() {
    if (currentTransaction) {
      throw new Error('Cannot nest transactions.');
    }

    currentTransaction = [];
    committedState = currentState;

    function finish(nextState) {
      currentTransaction = null;
      committedState = nextState;
      updateState(nextState);
    }

    function commit() {
      finish(currentState);
    }

    function rollback() {
      finish(committedState);
    }

    return { commit, rollback };
  }

  return {
    bindActions,
    observeStores,
    receive,
    transact
  };
}
