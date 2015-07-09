import expect from 'expect';
import { createStore, applyMiddleware } from '../src/index';
import * as reducers from './helpers/reducers';
import { addTodo, addTodoAsync, addTodoIfEmpty } from './helpers/actionCreators';
import thunk from '../src/middleware/thunk';

describe('applyMiddleware', () => {
  it('wraps dispatch method with middleware', () => {
    function test(spyOnMethods) {
      return methods => next => action => {
        spyOnMethods(methods);
        return next(action);
      };
    }

    const spy = expect.createSpy(() => {});
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos);
    store.dispatch(addTodo('Use Redux'));

    expect(Object.keys(spy.calls[0].arguments[0])).toEqual([
      'dispatch',
      'getState'
    ]);
    expect(store.getState()).toEqual([ { id: 1, text: 'Use Redux' } ]);
  });

  it('uses thunk middleware by default', done => {
    const store = applyMiddleware()(createStore)(reducers.todos);

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
});
