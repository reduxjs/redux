import expect from 'expect';
import { combineReducers } from '../../src';
import { ActionTypes } from '../../src/Store';

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
  });
});
