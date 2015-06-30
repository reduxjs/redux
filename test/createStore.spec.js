import expect from 'expect';
import { createStore } from '../src/index';
import * as reducers from './helpers/reducers';
import { addTodo, addTodoIfEmpty, addTodoAsync } from './helpers/actionCreators';

describe('createStore', () => {
  it('should expose the public API', () => {
    const store = createStore(reducers);
    const methods = Object.keys(store);

    expect(methods.length).toBe(5);
    expect(methods).toContain('subscribe');
    expect(methods).toContain('dispatch');
    expect(methods).toContain('getState');
    expect(methods).toContain('getReducer');
    expect(methods).toContain('replaceReducer');
  });

  it('should compose the reducers when passed an object', () => {
    const store = createStore(reducers);
    expect(store.getState()).toEqual({
      todos: [],
      todosReverse: []
    });
  });

  it('should pass the initial action and the initial state', () => {
    const store = createStore(reducers.todos, [{
      id: 1,
      text: 'Hello'
    }]);
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }]);
  });

  it('should provide the thunk middleware by default', done => {
    const store = createStore(reducers.todos);
    store.dispatch(addTodoIfEmpty('Hello'));
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }]);

    store.dispatch(addTodoIfEmpty('Hello'));
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }]);

    store.dispatch(addTodo('World'));
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }]);

    store.dispatch(addTodoAsync('Maybe')).then(() => {
      expect(store.getState()).toEqual([{
        id: 1,
        text: 'Hello'
      }, {
        id: 2,
        text: 'World'
      }, {
        id: 3,
        text: 'Maybe'
      }]);
      done();
    });
  });

  it('should dispatch the raw action without the middleware', () => {
    const store = createStore(reducers.todos, undefined, []);
    store.dispatch(addTodo('Hello'));
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }]);

    expect(() =>
      store.dispatch(addTodoAsync('World'))
    ).toThrow(/plain/);
  });

  it('should handle nested dispatches gracefully', () => {
    function foo(state = 0, action) {
      return action.type === 'foo' ? 1 : state;
    }

    function bar(state = 0, action) {
      return action.type === 'bar' ? 2 : state;
    }

    const store = createStore({ foo, bar });

    store.subscribe(function kindaComponentDidUpdate() {
      const state = store.getState();
      if (state.bar === 0) {
        store.dispatch({ type: 'bar' });
      }
    });

    store.dispatch({ type: 'foo' });
    expect(store.getState()).toEqual({
      foo: 1,
      bar: 2
    });
  });

  it('should support custom dumb middleware', done => {
    const doneMiddleware = next => action => {
      next(action);
      done();
    };

    const store = createStore(
      reducers.todos,
      undefined,
      [doneMiddleware]
    );
    store.dispatch(addTodo('Hello'));
  });

  it('should support custom smart middleware', done => {
    function doneMiddleware({ getState, dispatch }) {
      return next => action => {
        next(action);

        if (getState().length < 10) {
          dispatch(action);
        } else {
          done();
        }
      };
    }

    const store = createStore(
      reducers.todos,
      undefined,
      ({ getState, dispatch }) => [doneMiddleware({ getState, dispatch })]
    );
    store.dispatch(addTodo('Hello'));
  });
});
