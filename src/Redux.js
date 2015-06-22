export default class Redux {
  constructor(reducer, initialState) {
    this.state = initialState;
    this.listeners = [];
    this.replaceReducer(reducer);
  }

  getReducer() {
    return this.reducer;
  }

  replaceReducer(nextReducer) {
    this.reducer = nextReducer;
    this.dispatch({ type: '@@INIT' });
  }

  dispatch(action) {
    const { reducer } = this;
    this.state = reducer(this.state, action);
    this.listeners.forEach(listener => listener());
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    const { listeners } = this;
    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
}
