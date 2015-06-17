import expect from 'expect';
import mapValues from '../../src/utils/mapValues';

describe('Utils', () => {
  describe('mapValues', () => {
    it('should return object with mapped values', () => {
      const test = { 'a': 1, 'b': 2 };
      expect(mapValues(test, val => val * 3)).toEqual({ 'a': 3, 'b': 6 });
    });
  });
});

