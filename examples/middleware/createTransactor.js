function noop() {}

class Transactor {
  inProgress = false;
  actions = [];

  middleware(store) {
    this.store = store;

    return (state, dispatch) => {
      this.dispatch = dispatch;
      this.currentState = state;

      if (this.isCapturingState) {
        this.isCapturingState = false;
        return () => () => this.next(state);
      }

      return next => {
        this.next = next;

        return action => {
          if (this.inProgress) {
            this.actions.push(action);
            const nextState = this.reduceActions(this.headState, this.actions);
            return this.next(nextState);
          } else {
            const nextState = this.store(this.currentState, action);
            return this.next(nextState);
          }
        };
      };
    };
  }

  // Get the current state atom by running a dummy dispatch.
  getCurrentState() {
    this.isCapturingState = true;
    this.dispatch();
    return this.currentState;
  }

  reduceActions(initialState, actions) {
    return actions.reduce(
      (state, action) => this.store(state, action),
      initialState
    );
  }

  begin() {
    if (!this.inProgress) {
      this.inProgress = true;
      this.actions = [];
      this.headState = this.getCurrentState();
    }
  }

  commit() {
    if (this.inProgress) {
      this.inProgress = false;
      this.actions = [];
      delete this.headState;
      this.next(this.getCurrentState());
    }
  }

  rollback() {
    if (this.inProgress) {
      this.inProgress = false;
      this.actions = [];
      this.currentState = this.headState;
      delete this.headState;
      return this.next(this.currentState);
    }
  }

  getStatus() {
    const { inProgress, actions, headState } = this;

    return { inProgress, actions, headState };
  }
}

export default function createTransactor() {
  const transactor = new Transactor();

  const middleware = ::transactor.middleware;
  middleware.begin = ::transactor.begin;
  middleware.commit = ::transactor.commit;
  middleware.rollback = ::transactor.rollback;
  middleware.getStatus = ::transactor.getStatus;

  return middleware;
}
