import expect from 'expect';
import { combineReducers } from '../../src';
import { ActionTypes } from '../../src/createStore';

describe('Utils', () => {
  describe('combineReducers', () => {
    it('should return a composite reducer that maps the state keys to given reducers', () => {
      const reducer = combineReducers({
        counter: (state = 0, action) =>
          action.type === 'increment' ? state + 1 : state,
        stack: (state = [], action) =>
          action.type === 'push' ? [...state, action.value] : state
      });

      const s1 = reducer({}, { type: 'increment' });
      expect(s1).toEqual({ counter: 1, stack: [] });
      const s2 = reducer(s1, { type: 'push', value: 'a' });
      expect(s2).toEqual({ counter: 1, stack: ['a'] });
    });

    it('ignores all props which are not a function', () => {
      const reducer = combineReducers({
        fake: true,
        broken: 'string',
        another: { nested: 'object' },
        stack: (state = []) => state
      });

      expect(
        Object.keys(reducer({}, { type: 'push' }))
      ).toEqual(['stack']);
    });

    it('should throw an error if a reducer returns undefined handling an action', () => {
      const reducer = combineReducers({
        counter(state = 0, action) {
          switch (action && action.type) {
          case 'increment':
            return state + 1;
          case 'decrement':
            return state - 1;
          case 'whatever':
          case null:
          case undefined:
            return undefined;
          default:
            return state;
          }
        }
      });

      expect(
        () => reducer({ counter: 0 }, { type: 'whatever' })
      ).toThrow(
        /"counter".*"whatever"/
      );
      expect(
        () => reducer({ counter: 0 }, null)
      ).toThrow(
        /"counter".*an action/
      );
      expect(
        () => reducer({ counter: 0 }, {})
      ).toThrow(
        /"counter".*an action/
      );
    });

    it('should throw an error if a reducer returns undefined initializing', () => {
      expect(() => combineReducers({
        counter(state, action) {
          switch (action.type) {
          case 'increment':
            return state + 1;
          case 'decrement':
            return state - 1;
          default:
            return state;
          }
        }
      })).toThrow(
        /"counter".*initialization/
      );
    });

    it('should allow a symbol to be used as an action type', () => {
      const increment = Symbol('INCREMENT');

      const reducer = combineReducers({
        counter(state = 0, action) {
          switch (action.type) {
          case increment:
            return state + 1;
          default:
            return state;
          }
        }
      });

      expect(reducer({counter: 0}, { type: increment }).counter).toEqual(1);
    });

    it('should throw an error if a reducer attempts to handle a private action', () => {
      expect(() => combineReducers({
        counter(state, action) {
          switch (action.type) {
          case 'increment':
            return state + 1;
          case 'decrement':
            return state - 1;
          // Never do this in your code:
          case ActionTypes.INIT:
            return 0;
          default:
            return undefined;
          }
        }
      })).toThrow(
        /"counter".*private/
      );
    });

    it('should warn if no reducers are passed to combineReducers', () => {
      const spy = expect.spyOn(console, 'error');
      const reducer = combineReducers({});
      reducer({});
      expect(spy.calls[0].arguments[0]).toMatch(
        /Store does not have a valid reducer/
      );
      spy.restore();
    });

    it('should warn if initial state object does not match state object returned by reducer', () => {
      const spy = expect.spyOn(console, 'error');
      const reducerCreator = () => {
        return combineReducers({
          foo(state = {bar: 1}) {
            return state;
          },
          baz(state = {qux: 3}) {
            return state;
          }
        });
      };

      reducerCreator()({foo: {bar: 2}});
      expect(spy.calls.length).toBe(0);

      reducerCreator()({
        foo: {bar: 2},
        baz: {qux: 4}
      });
      expect(spy.calls.length).toBe(0);

      reducerCreator()({bar: 2});
      expect(spy.calls[0].arguments[0]).toMatch(
        /Unexpected key "bar".*instead: "foo", "baz"/
      );

      reducerCreator()({bar: 2, qux: 4});
      expect(spy.calls[1].arguments[0]).toMatch(
        /Unexpected keys "bar", "qux".*instead: "foo", "baz"/
      );

      reducerCreator()(1);
      expect(spy.calls[2].arguments[0]).toMatch(
        /unexpected type of "Number".*keys: "foo", "baz"/
      );

      spy.restore();
    });

    it('should only check state shape on init', () => {
      const spy = expect.spyOn(console, 'error');
      const reducer = combineReducers({
        foo(state = {bar: 1}) {
          return state;
        }
      });

      reducer({bar: 1});
      expect(spy.calls[0].arguments[0]).toMatch(
        /Unexpected key "bar".*instead: "foo"/
      );

      reducer({bar: 1});
      expect(spy.calls.length).toBe(1);

      spy.restore();
    });
  });
});
