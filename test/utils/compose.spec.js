import expect from 'expect';
import { compose } from '../../src';

describe('Utils', () => {
  describe('compose', () => {
    it('composes functions from left to right', () => {
      const a = next => x => next(x + 'a');
      const b = next => x => next(x + 'b');
      const c = next => x => next(x + 'c');
      const final = x => x;

      expect(compose(a, b, c, final)('')).toBe('abc');
      expect(compose(b, c, a, final)('')).toBe('bca');
      expect(compose(c, a, b, final)('')).toBe('cab');
    });
  });
});
