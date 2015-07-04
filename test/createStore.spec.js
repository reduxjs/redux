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
});
