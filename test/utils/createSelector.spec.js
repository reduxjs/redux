import expect from 'expect';
import { createSelector } from '../../src';

describe('Utils', () => {
  describe('createSelector', () => {
    it('should create a simple string based key selector', () => {
      let simpleKeySelector = createSelector('x');

      expect(simpleKeySelector({x: 2})).toEqual(2);
    });

    it('should create a chained selector', () => {
      let simpleSelector = createSelector('a');
      let chainedSelector = createSelector(simpleSelector, (a) => a.x)

      expect(chainedSelector({a: {x: 2}})).toEqual(2);

    });

    it('should create a mixed chained selector', () => {
      let simpleSelector = createSelector('a');
      let chainedSelector = createSelector(simpleSelector, 'b', (a, b) => a + b)

      expect(chainedSelector({a: 1, b: 1})).toEqual(2);
    });
  });
});
