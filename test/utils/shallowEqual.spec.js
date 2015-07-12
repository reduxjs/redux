import expect from 'expect';
import shallowEqual from '../../src/utils/shallowEqual';

describe('Utils', () => {
  // More info: https://github.com/gaearon/redux/pull/75#issuecomment-111635748
  describe('shallowEqual', () => {
    it('should return true if arguments fields are equal', () => {
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
      expect(
          shallowEqual(
              null,
              null
          )
      ).toBe(true);
      expect(
          shallowEqual(
              1,
              1
          )
      ).toBe(true);
    });

    it('should return false if first argument has too many keys', () => {
      expect(
        shallowEqual(
          { a: 1, b: 2, c: 3 },
          { a: 1, b: 2 }
        )
      ).toBe(false);
    });

    it('should return false if second argument has too many keys', () => {
      expect(
        shallowEqual(
          { a: 1, b: 2 },
          { a: 1, b: 2, c: 3 }
        )
      ).toBe(false);
    });

    it('should return false if arguments have different keys', () => {
      expect(
        shallowEqual(
          { a: 1, b: 2, c: undefined },
          { a: 1, bb: 2, c: undefined }
        )
      ).toBe(false);
    });
    it('should return false if different values', () => {
      expect(
          shallowEqual(
              { a: 1, b: 2, c: {} },
              { a: 1, b: 2, c: {} }
          )
      ).toBe(false);
    });
    it('should return true if both empty objects', () => {
      expect(
          shallowEqual(
              {},
              {}
          )
      ).toBe(true);
    });
    it('should return false if object and null', () => {
      expect(
          shallowEqual(
             null,
              {}
          )
      ).toBe(false);
    });
  });
});
