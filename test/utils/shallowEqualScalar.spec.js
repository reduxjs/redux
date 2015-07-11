import expect from 'expect';
import shallowEqualScalar from '../../src/utils/shallowEqualScalar';

describe('Utils', () => {
  describe('shallowEqualScalar', () => {
    it('should return true if both arguments are the same object', () => {
      const o = { a: 1, b: 2 };
      expect(shallowEqualScalar(o, o)).toBe(true);
    });

    it('should return false if either argument is null', () => {
      expect(shallowEqualScalar(null, {})).toBe(false);
      expect(shallowEqualScalar({}, null)).toBe(false);
    });

    it('should return true if arguments fields are equal', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2, c: undefined },
          { a: 1, b: 2, c: undefined }
        )
      ).toBe(true);

      expect(
        shallowEqualScalar(
          { a: 1, b: 2, c: 3 },
          { a: 1, b: 2, c: 3 }
        )
      ).toBe(true);
    });

    it('should return false if first argument has too many keys', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2, c: 3 },
          { a: 1, b: 2 }
        )
      ).toBe(false);
    });

    it('should return false if second argument has too many keys', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2 },
          { a: 1, b: 2, c: 3 }
        )
      ).toBe(false);
    });

    it('should return false if arguments have keys dont have same value', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2 },
          { a: 1, b: 3 }
        )
      ).toBe(false);
    });

    it('should return false if arguments have field that are objects', () => {
      const o = {};
      expect(
        shallowEqualScalar(
          { a: 1, b: 2, c: o },
          { a: 1, b: 2, c: o }
        )
      ).toBe(false);
    });

    it('should return false if arguments have different keys', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2, c: undefined },
          { a: 1, bb: 2, c: undefined }
        )
      ).toBe(false);
    });
  });
});
