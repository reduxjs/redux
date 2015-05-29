function mapValues(obj, fn) {
  const result = {};
  Object.keys(obj).forEach(key =>
    result[key] = fn(obj[key], key)
  );
  return result;
}

export default function createDispatcher(stores, actionCreators, initialState) {
  // To compute the next state, combine the next states of every store
  function computeState(state, action) {
    return mapValues(stores,
      (store, key) => store(state[key], action)
    );
  }

  // Keep all store observers by key
  const observers = mapValues(stores, () => []);
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

  // Reassign the current state on each dispatch
  let currentState = initialState || computeState({});
  function dispatch(action) {
    // Swap the state
    const previousState = currentState;
    currentState = computeState(currentState, action);

    // Notify the observers
    const changedKeys = Object.keys(currentState).filter(key =>
      currentState[key] !== previousState[key]
    );
    emitChange(changedKeys);
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

  // Provide dispatching
  function bindActions(pickActions) {
    return mapValues(
      pickActions(actionCreators),
      (actionCreator) => (...args) => dispatch(actionCreator(...args))
    );
  }

  function getState() {
    return currentState;
  }

  return {
    bindActions,
    observeStores,
    getState
  };
}
