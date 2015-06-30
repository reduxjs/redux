import expect from 'expect';
import { composeStores } from '../src';

// UNDEF = undefined;
const UNDEF = void 0;

describe('Utils', () => {
  describe('composeStores', () => {
    it('should return a store that maps state keys to reducer functions', () => {
      const store = composeStores({
        counter: (state = 0, action) =>
          action.type === 'increment' ? state + 1 : state,
        stack: (state = [], action) =>
          action.type === 'push' ? [...state, action.value] : state
      });

      const s1 = store({}, { type: 'increment' });
      expect(s1).toEqual({ counter: 1, stack: [] });
      const s2 = store(s1, { type: 'push', value: 'a' });
      expect(s2).toEqual({ counter: 1, stack: ['a'] });
    });

    it('should ignore all props which are not a function', () => {
      const store = composeStores({
        fake: true,
        broken: 'string',
        another: {nested: 'object'},
        stack: (state = []) => state
      });

      expect(Object.keys(store({}, {type: 'push'}))).toEqual(['stack']);
    });
    it('should throw an error if undefined return from store', () => {
      const store = composeStores({
        stack: (state = []) => state,
        bad: (state = [], action) => {
          if (action.type === 'something') {
            return state;
          }
        }
      });
      expect(() => store({}, {type: '@@testType'})).toThrow();
    });
    it('should throw an error if undefined return not by default', () => {
      const store = composeStores({
        stack: (state = []) => state,
        bad: (state = 1, action) => {
          if (action.type === 'something') {
            return UNDEF;
          }
          return state;
        }
      });
      expect(store({}, {type: '@@testType'})).toEqual({stack: [], bad: 1});
      expect(() => store({}, {type: 'something'})).toThrow();
    });
  });
});
