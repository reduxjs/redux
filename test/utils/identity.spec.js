import expect from 'expect';
import identity from '../../src/utils/identity';

describe('Utils', () => {
  describe('identity', () => {
    it('should return first argument passed to it', () => {
      const test = { 'a': 1 };
      expect(identity(test, 'test')).toBe(test);
    });
  });
});
