import expect from 'expect';
import { createBuffered } from '../../src';

describe('Utils', () => {
  describe('createBuffered', () => {
    it('should create a memoized function with cachesize=1', () => {
      let counter = 0;
      let bufferedFunction = createBuffered( (input) => {
        ++counter;
        return input * 2;
      });

      expect( bufferedFunction(1) ).toEqual(2);
      expect( counter ).toEqual(1);
      expect( bufferedFunction(1) ).toEqual(2);
      expect( counter ).toEqual(1);
      expect( bufferedFunction(2) ).toEqual(4);
      expect( counter ).toEqual(2);
    })
  });
});