export const WILL_NAVIGATE = '@@react-router/WILL_NAVIGATE'

const initialState = {
  locationBeforeTransitions: null
}

// Mount this reducer to handle location changes
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case WILL_NAVIGATE:
      // Use a descriptive name to make it less tempting to reach into it
      return {
        locationBeforeTransitions: action.locationBeforeTransitions
      }
    default:
      return state
  }
}

export function syncHistoryWithStore(history, store, {
  // Specify where you mounted the reducer
  selectLocationState = state => state.routing,
  adjustUrlOnReplay = false
} = {}) {
  let initialLocation
  let currentLocation
  let isTimeTraveling
  let unsubscribeFromStore
  let unsubscribeFromHistory

  // What does the store say about current location?
  const getLocationInStore = (useInitialIfEmpty) => {
    const locationState = selectLocationState(store.getState())
    return locationState.locationBeforeTransitions ||
      (useInitialIfEmpty ? initialLocation : undefined)
  }

  // Whenever store changes due to time travel, keep address bar in sync
  const handleStoreChange = () => {
    const locationInStore = getLocationInStore(true)
    if (currentLocation === locationInStore) {
      return
    }

    // Update address bar to reflect store state
    isTimeTraveling = true
    currentLocation = locationInStore
    history.replace(locationInStore)
    isTimeTraveling = false
  }

  if (adjustUrlOnReplay) {
    unsubscribeFromStore = store.subscribe(handleStoreChange)
    handleStoreChange()
  }

  // Whenever location changes, dispatch an action to get it in the store
  const handleLocationChange = (location) => {
    // ... unless we just caused that location change
    if (isTimeTraveling) {
      return
    }

    // Remember where we are
    currentLocation = location

    // Are we being called for the first time?
    if (!initialLocation) {
      // Remember as a fallback in case state is reset
      initialLocation = location

      // Respect persisted location, if any
      if (getLocationInStore()) {
        return
      }
    }

    // Tell the store to update by dispatching an action
    store.dispatch({
      type: WILL_NAVIGATE,
      locationBeforeTransitions: location
    })
  }
  unsubscribeFromHistory = history.listen(handleLocationChange)

  // The enhanced history uses store as source of truth
  return Object.assign({}, history, {
    // The listeners are subscribed to the store instead of history
    listen(listener) {
      return store.subscribe(() =>
        listener(getLocationInStore(true))
      )
    },

    // It also provides a way to destroy internal listeners
    dispose() {
      if (adjustUrlOnReplay) {
        unsubscribeFromStore()
      }
      unsubscribeFromHistory()
    }
  })
}
