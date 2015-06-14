/* @flow */

import compose from './utils/composeMiddleware';

import type { Middleware, Store, Action, State, Dispatcher } from './types';

export default function createDispatcher(
  store: Store,
  middlewares: (Middleware[] | (getState: () => State) => Middleware[]) = []
): Dispatcher {
  return function dispatcher(
    initialState: State,
    setState: (state: State) => State
  ) {
    var state: State = setState(store(initialState, {}));

    function dispatch(action: Action): Action {
      state = setState(store(state, action));
      return action;
    }

    function getState(): State {
      return state;
    }

    if (typeof middlewares === 'function') {
      middlewares = middlewares(getState);
    }

    return compose(...middlewares, dispatch);
  };
}
