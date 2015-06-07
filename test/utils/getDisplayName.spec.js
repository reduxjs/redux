import { expect } from 'chai';
import getDisplayName from '../../src/utils/getDisplayName';

describe('Utils', () => {
  describe('getDisplayName', () => {

    it('should ensure a name for the given component', () => {
      const names = [
        { displayName: 'Foo'},
        { name: 'Bar' },
        {}
      ].map(getDisplayName);

      expect(names).to.deep.equal(['Foo', 'Bar', 'Component']);
    });
  });
});
