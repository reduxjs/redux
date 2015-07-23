import expect from 'expect';
import { createStore, combineReducers } from '../src/index';
import { addTodo } from './helpers/actionCreators';
import * as reducers from './helpers/reducers';

describe('createStore', () => {
  it('should expose the public API', () => {
    const store = createStore(combineReducers(reducers));
    const methods = Object.keys(store);

    expect(methods.length).toBe(5);
    expect(methods).toContain('subscribe');
    expect(methods).toContain('dispatch');
    expect(methods).toContain('getState');
    expect(methods).toContain('getReducer');
    expect(methods).toContain('replaceReducer');
  });

  it('should require a reducer function', () => {
    expect(() =>
      createStore()
    ).toThrow();

    expect(() =>
      createStore('test')
    ).toThrow();

    expect(() =>
      createStore({})
    ).toThrow();

    expect(() =>
      createStore(() => {})
    ).toNotThrow();
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

  it('should apply the reducer to the previous state', () => {
    const store = createStore(reducers.todos);
    expect(store.getState()).toEqual([]);

    store.dispatch({});
    expect(store.getState()).toEqual([]);

    store.dispatch(addTodo('Hello'));
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
  });

  it('should apply the reducer to the initial state', () => {
    const store = createStore(reducers.todos, [{
      id: 1,
      text: 'Hello'
    }]);
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }]);

    store.dispatch({});
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
  });

  it('should preserve the state when replacing a reducer', () => {
    const store = createStore(reducers.todos);
    store.dispatch(addTodo('Hello'));
    store.dispatch(addTodo('World'));
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }]);

    let nextStore = createStore(reducers.todosReverse);
    store.replaceReducer(nextStore.getReducer());
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }]);

    store.dispatch(addTodo('Perhaps'));
    expect(store.getState()).toEqual([{
      id: 3,
      text: 'Perhaps'
    }, {
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }]);

    nextStore = createStore(reducers.todos);
    store.replaceReducer(nextStore.getReducer());
    expect(store.getState()).toEqual([{
      id: 3,
      text: 'Perhaps'
    }, {
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }]);

    store.dispatch(addTodo('Surely'));
    expect(store.getState()).toEqual([{
      id: 3,
      text: 'Perhaps'
    }, {
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }, {
      id: 4,
      text: 'Surely'
    }]);
  });

  it('should support multiple subscriptions', () => {
    const store = createStore(reducers.todos);
    const listenerA = expect.createSpy(() => {});
    const listenerB = expect.createSpy(() => {});

    let unsubscribeA = store.subscribe(listenerA);
    store.dispatch({});
    expect(listenerA.calls.length).toBe(1);
    expect(listenerB.calls.length).toBe(0);

    store.dispatch({});
    expect(listenerA.calls.length).toBe(2);
    expect(listenerB.calls.length).toBe(0);

    const unsubscribeB = store.subscribe(listenerB);
    expect(listenerA.calls.length).toBe(2);
    expect(listenerB.calls.length).toBe(0);

    store.dispatch({});
    expect(listenerA.calls.length).toBe(3);
    expect(listenerB.calls.length).toBe(1);

    unsubscribeA();
    expect(listenerA.calls.length).toBe(3);
    expect(listenerB.calls.length).toBe(1);

    store.dispatch({});
    expect(listenerA.calls.length).toBe(3);
    expect(listenerB.calls.length).toBe(2);

    unsubscribeB();
    expect(listenerA.calls.length).toBe(3);
    expect(listenerB.calls.length).toBe(2);

    store.dispatch({});
    expect(listenerA.calls.length).toBe(3);
    expect(listenerB.calls.length).toBe(2);

    unsubscribeA = store.subscribe(listenerA);
    expect(listenerA.calls.length).toBe(3);
    expect(listenerB.calls.length).toBe(2);

    store.dispatch({});
    expect(listenerA.calls.length).toBe(4);
    expect(listenerB.calls.length).toBe(2);
  });

  it('should provide an up-to-date state when a subscriber is notified', done => {
    const store = createStore(reducers.todos);
    store.subscribe(() => {
      expect(store.getState()).toEqual([{
        id: 1,
        text: 'Hello'
      }]);
      done();
    });
    store.dispatch(addTodo('Hello'));
  });

  it('should only accept plain object actions', () => {
    const store = createStore(reducers.todos);
    expect(() =>
      store.dispatch({})
    ).toNotThrow();

    function AwesomeMap() { }
    [null, undefined, 42, 'hey', new AwesomeMap()].forEach(nonObject =>
      expect(() =>
        store.dispatch(nonObject)
      ).toThrow(/plain/)
    );
  });

  it('should handle nested dispatches gracefully', () => {
    function foo(state = 0, action) {
      return action.type === 'foo' ? 1 : state;
    }

    function bar(state = 0, action) {
      return action.type === 'bar' ? 2 : state;
    }

    const store = createStore(combineReducers({ foo, bar }));

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
