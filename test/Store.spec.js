import expect from 'expect';
import Store from '../src/Store';
import { todos, todosReverse } from './helpers/reducers';
import { addTodo } from './helpers/actionCreators';

describe('Store', () => {
  it('should require a reducer function', () => {
    expect(() =>
      new Store()
    ).toThrow();

    expect(() =>
      new Store('test')
    ).toThrow();

    expect(() =>
      new Store({})
    ).toThrow();

    expect(() =>
      new Store(() => {})
    ).toNotThrow();
  });

  it('should apply the reducer to the previous state', () => {
    const store = new Store(todos);
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
    const store = new Store(todos, [{
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
    const store = new Store(todos);
    store.dispatch(addTodo('Hello'));
    store.dispatch(addTodo('World'));
    expect(store.getState()).toEqual([{
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }]);

    let nextStore = new Store(todosReverse);
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
      id: 2,
      text: 'Perhaps'
    }, {
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }]);

    nextStore = new Store(todos);
    store.replaceReducer(nextStore.getReducer());
    expect(store.getState()).toEqual([{
      id: 2,
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
      id: 2,
      text: 'Perhaps'
    }, {
      id: 1,
      text: 'Hello'
    }, {
      id: 2,
      text: 'World'
    }, {
      id: 3,
      text: 'Surely'
    }]);
  });

  it('should support multiple subscriptions', () => {
    const store = new Store(todos);
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
    const store = new Store(todos);
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
    const store = new Store(todos);
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
});
