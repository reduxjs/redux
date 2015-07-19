import expect from 'expect';
import { composeMiddleware } from '../../src';

describe('Utils', () => {
  describe('composeMiddleware', () => {
    it('should return combined middleware that executes from left to right', () => {
      const a = () => next => action => next(action + 'a');
      const b = () => next => action => next(action + 'b');
      const c = () => next => action => next(action + 'c');
      const dispatch = action => action;

      expect(composeMiddleware(a, b, c)()(dispatch)('')).toBe('abc');
      expect(composeMiddleware(b, c, a)()(dispatch)('')).toBe('bca');
      expect(composeMiddleware(c, a, b)()(dispatch)('')).toBe('cab');
    });
  });
});
