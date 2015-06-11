import expect from 'expect';
import { compose } from '../src';

describe('Utils', () => {
  describe('compose', () => {
    it('should return combined middleware that executes from left to right', () => {
      const a = next => action => next(action + 'a');
      const b = next => action => next(action + 'b');
      const c = next => action => next(action + 'c');
      const dispatch = action => action;

      expect(compose(a, b, c, dispatch)('')).toBe('abc');
      expect(compose(b, c, a, dispatch)('')).toBe('bca');
      expect(compose(c, a, b, dispatch)('')).toBe('cab');
    });
  });
});
