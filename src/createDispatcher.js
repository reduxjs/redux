import mapValues from 'lodash/object/mapValues';
import invariant from 'invariant';

// An action dispatched to init store state
const BOOTSTRAP_STORE = {
  type: 'BOOTSTRAP_STORE'
};

export default function createDispatcher() {
  let observers = {};
  let stores = {};
  let currentState = {};

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

  // Merge the newly added stores
  function mergeStores(newStores) {
    newStores.forEach(newStore => {
      const key = newStore.name;
      stores[key] = newStore;
      observers[key] = observers[key] || [];
    });
    dispatch(BOOTSTRAP_STORE);
  }

  // Provide subscription and unsubscription
  function observeStores(observedStores, onChange) {
    mergeStores(observedStores);
    const observedKeys = observedStores.map(s => s.name);

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

  // Bind an action creator to the dispatcher
  function wrapActionCreator(actionCreator) {
    return function dispatchAction(...args) {
      const action = actionCreator(...args);
      if (typeof action === 'function') {
        // Callback-style action creator
        action(dispatch, currentState);
      } else {
        // Simple action creator
        dispatch(action);
      }
    };
  }

  return {
    wrapActionCreator,
    observeStores
  };
}
