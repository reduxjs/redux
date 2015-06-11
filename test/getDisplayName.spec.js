import expect from 'expect';
import getDisplayName from '../src/utils/getDisplayName';

describe('Utils', () => {
  describe('getDisplayName', () => {

    it('should ensure a name for the given component', () => {
      const names = [
        { displayName: 'Foo'},
        { name: 'Bar' },
        {}
      ].map(getDisplayName);

      expect(names).toEqual(['Foo', 'Bar', 'Component']);
    });
  });
});
