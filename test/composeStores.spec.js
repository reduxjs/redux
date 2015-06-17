import expect from 'expect';
import { composeStores } from '../src';

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
  });
});
