import expect from 'expect';
import { createRedux } from '../src';
import * as helpers from './_helpers';

const { defaultText, todoActions, todoStore } = helpers;
const { addTodo } = todoActions;

describe('createRedux', () => {

  let redux;

  beforeEach(() => {
    redux = createRedux({ todoStore });
  });

  it('should expose Redux public API', () => {
    const methods = Object.keys(redux);

    expect(methods.length).toBe(5);
    expect(methods).toContain('subscribe');
    expect(methods).toContain('dispatch');
    expect(methods).toContain('getState');
    expect(methods).toContain('getDispatcher');
    expect(methods).toContain('replaceDispatcher');
  });

  it('should subscribe to changes', done => {
    let state = redux.getState();
    expect(state.todoStore).toEqual({});
    redux.subscribe(() => {
      state = redux.getState();
      expect(state.todoStore).toEqual([{ id: 1, text: 'Hello World!' }]);
      done();
    });
    redux.dispatch(addTodo(defaultText));
  });

  it('should unsubscribe a listener', () => {
    const changeListenerSpy = expect.createSpy(() => {});
    const unsubscribe = redux.subscribe(changeListenerSpy);

    expect(changeListenerSpy.calls.length).toBe(0);

    redux.dispatch(addTodo('Hello'));
    expect(redux.getState().todoStore).toEqual([{ id: 1, text: 'Hello'}]);
    expect(changeListenerSpy.calls.length).toBe(1);

    unsubscribe();
    redux.dispatch(addTodo('World'));
    expect(redux.getState().todoStore).toEqual([
      { id: 2, text: 'World'},
      { id: 1, text: 'Hello'}
    ]);
    expect(changeListenerSpy.calls.length).toBe(1);
  });

  it('should use existing state when replacing the dispatcher', () => {
    redux.dispatch(addTodo('Hello'));

    let nextRedux = createRedux({ todoStore });
    redux.replaceDispatcher(nextRedux.getDispatcher());

    let state;
    let action = (_, getState) => {
      state = getState().todoStore;
    };

    redux.dispatch(action);

    expect(state).toEqual(redux.getState().todoStore);
  });

  it('should handle nested dispatches gracefully', () => {
    function foo(state = 0, action) {
      return action.type === 'foo' ? 1 : state;
    }

    function bar(state = 0, action) {
      return action.type === 'bar' ? 2 : state;
    }

    const redux = createRedux({ foo, bar });

    redux.subscribe(() => {
      // What the Connector ends up doing.
      const state = redux.getState();
      if (state.foo !== 0) {
        redux.dispatch({type: 'bar'});
      }
    });

    redux.dispatch({type: 'foo'});

    // Either this or throw an error when nesting dispatchers
    expect(redux.getState()).toEqual({foo: 1, bar: 2});
  });
});
