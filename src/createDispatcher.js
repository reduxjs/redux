import mapValues from 'lodash/object/mapValues';
import invariant from 'invariant';

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
      (store, key) => {
        const nextStoreState = store(state[key], action);
        invariant(
          nextStoreState != null,
          'State returned by %s is null or undefined.',
          key
        );
        return nextStoreState;
      }
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
    invariant(
      typeof action.type === 'string',
      'Action type must be a string.'
    );

    const nextState = computeNextState(currentState, action);
    updateState(nextState);
  }

  // Provide subscription and unsubscription
  function observeStores(observedKeys, onChange) {
    // Emit the state update
    function handleChange() {
      onChange(currentState);
    }

    // Synchronously emit the initial value
    handleChange();

    // Register the observer for each relevant key
    observedKeys.forEach(key =>
      observers[key].push(handleChange)
    );

    // Let it unregister when the time comes
    return () => {
      observedKeys.forEach(key => {
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
  function wrapActionCreator(actionCreator) {
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
  function getActions() {
    return actionCreators;
  }

  // Provide a way to receive new stores and actions
  function receive(nextStores, nextActionCreators) {
    stores = nextStores;
    actionCreators = mapValues(nextActionCreators, wrapActionCreator);

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
    getActions,
    observeStores,
    receive,
    transact
  };
}
