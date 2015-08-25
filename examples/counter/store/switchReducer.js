// Note: this is meant to be provided in a separate package.
// I'm only including it here for discussion.

const SWITCH_REDUCER = { type: 'redux-switch/SWITCH_REDUCER' };

export default function switchReducer(onNextReducer) {
  return next => (reducer, initialState) => {
    let currentReducer = reducer;
    let switchingReducer = (state, action) => currentReducer(state, action);
    let store = next(switchingReducer, initialState);

    onNextReducer(nextReducer => {
      currentReducer = nextReducer;
      store.dispatch({ type: SWITCH_REDUCER });
    });

    return store;
  };
}
