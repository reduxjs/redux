export default function persistState(sessionId) {
  if (!sessionId) {
    return next => (...args) => next(...args);
  }

  return next => (reducer, initialState) => {
    const key = `redux-dev-session-${sessionId}`;

    try {
      initialState = JSON.parse(localStorage.getItem(key)) || initialState;
      next(reducer, initialState);
    } catch (e) {
      try {
        localStorage.removeItem(key);
      } finally {
        initialState = undefined;
      }
    }

    const store = next(reducer, initialState);

    return Object.assign(Object.create(store), {
      dispatch(action) {
        store.dispatch(action);
        localStorage.setItem(key, JSON.stringify(store.getState()));
        return action;
      }
    });
  };
}
