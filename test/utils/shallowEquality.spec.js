import expect from 'expect';
import shallowEqualScalar from '../../src/utils/shallowEqualScalar';
import shallowEqual from '../../src/utils/shallowEqual';

describe('Utils', () => {
  // More info: https://github.com/gaearon/redux/pull/75#issuecomment-111635748
  describe('shallowEqualScalar', () => {
    it('returns true if both arguments are the same object', () => {
      const o = { a: 1, b: 2 };
      expect(shallowEqualScalar(o, o)).toBe(true);
    });

    it('returns false if either argument is null', () => {
      expect(shallowEqualScalar(null, {})).toBe(false);
      expect(shallowEqualScalar({}, null)).toBe(false);
    });

    it('returns true if arguments fields are equal', () => {
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

    it('returns false if first argument has too many keys', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2, c: 3 },
          { a: 1, b: 2 }
        )
      ).toBe(false);
    });

    it('returns false if second argument has too many keys', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2 },
          { a: 1, b: 2, c: 3 }
        )
      ).toBe(false);
    });

    it('returns false if arguments have keys dont have same value', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2 },
          { a: 1, b: 3 }
        )
      ).toBe(false);
    });

    it('returns false if arguments have field that are objects', () => {
      const o = {};
      expect(
        shallowEqualScalar(
          { a: 1, b: 2, c: o },
          { a: 1, b: 2, c: o }
        )
      ).toBe(false);
    });

    it('returns false if arguments have different keys', () => {
      expect(
        shallowEqualScalar(
          { a: 1, b: 2, c: undefined },
          { a: 1, bb: 2, c: undefined }
        )
      ).toBe(false);
    });
  });

  describe('shallowEqual', () => {
    it('returns true if arguments fields are equal', () => {
      expect(
        shallowEqual(
          { a: 1, b: 2, c: undefined },
          { a: 1, b: 2, c: undefined }
        )
      ).toBe(true);

      expect(
        shallowEqual(
          { a: 1, b: 2, c: 3 },
          { a: 1, b: 2, c: 3 }
        )
      ).toBe(true);

      const o = {};
      expect(
        shallowEqual(
          { a: 1, b: 2, c: o },
          { a: 1, b: 2, c: o }
        )
      ).toBe(true);
    });

    it('returns false if first argument has too many keys', () => {
      expect(
        shallowEqual(
          { a: 1, b: 2, c: 3 },
          { a: 1, b: 2 }
        )
      ).toBe(false);
    });

    it('returns false if second argument has too many keys', () => {
      expect(
        shallowEqual(
          { a: 1, b: 2 },
          { a: 1, b: 2, c: 3 }
        )
      ).toBe(false);
    });

    it('returns false if arguments have different keys', () => {
      expect(
        shallowEqual(
          { a: 1, b: 2, c: undefined },
          { a: 1, bb: 2, c: undefined }
        )
      ).toBe(false);
    });
  });

});
