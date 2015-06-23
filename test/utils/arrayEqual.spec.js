import expect from 'expect';
import arrayEqual from '../../src/utils/arrayEqual';

describe('Utils', () => {
  describe('arrayEqual', () => {
    it('should test two identical arrays for equality', () => {
      let array1 = [1,2,3];
      let array2 = [1,2,3];

      expect( arrayEqual(array1, array1)).toBe(true);
      expect( arrayEqual(array1, array2)).toBe(true);
      expect( arrayEqual(array2, array1)).toBe(true);
    });

    it('should test two unidentical array for unequality', () => {
      let array1 = [1,2,3];
      let array2 = [3,2,3];
      let array3 = [1,2,3,4];

      expect( arrayEqual(array1, array2)).toBe(false);
      expect( arrayEqual(array1, array3)).toBe(false);
      expect( arrayEqual(array2, array3)).toBe(false);
    });

    it('should test type correctness of parameters', () => {
      let array = [1,2];

      expect(arrayEqual(array, 1)).toBe(false);
      expect(arrayEqual(array, null)).toBe(false);
      expect(arrayEqual(array, undefined)).toBe(false);
    });
  });
});