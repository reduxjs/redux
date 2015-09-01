import expect from 'expect';
import { compose } from '../../src';

describe('Utils', () => {
  describe('compose', () => {
    it('composes from right to left', () => {
      const double = x => x * 2;
      const square = x => x * x;
      expect(compose(square)(5)).toBe(25);
      expect(compose(square, double)(5)).toBe(100);
      expect(compose(double, square, double)(5)).toBe(200);
    });

    it('composes functions from right to left', () => {
      const a = next => x => next(x + 'a');
      const b = next => x => next(x + 'b');
      const c = next => x => next(x + 'c');
      const final = x => x;

      expect(compose(a, b, c)(final)('')).toBe('abc');
      expect(compose(b, c, a)(final)('')).toBe('bca');
      expect(compose(c, a, b)(final)('')).toBe('cab');
    });
  });
});
