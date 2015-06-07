class Transactor {
  inProgress = false;
  actions = [];

  middleware(getAtom, store) {
    this.store = store;
    this.getAtom = getAtom;
    this.headState = getAtom();

    return next => {
      this.next = next;

      return action => {
        if (this.inProgress) {
          this.actions.push(action);
          return next(this.reduceActions(this.headState, this.actions));
        } else {
          const state = this.store(this.getAtom(), action);
          this.headState = state;
          return next(state);
        }
      };
    };
  }

  reduceActions(initialState, actions) {
    return actions.reduce(
      (state, action) => this.store(state, action),
      initialState
    );
  }

  begin() {
    this.inProgress = true;
    this.dirty = false;
    this.actions = [];
  }

  commit() {
    this.inProgress = false;
    this.dirty = false;
    this.actions = [];
    this.headState = this.getAtom();
  }

  rollback() {
    const { headState } = this;
    this.inProgress = false;
    this.dirty = false;
    this.actions = [];
    return this.next(headState);
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
