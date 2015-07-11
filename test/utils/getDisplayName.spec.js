import expect from 'expect';
import { createClass, Component } from 'react';
import getDisplayName from '../../src/utils/getDisplayName';

describe('Utils', () => {
  describe('getDisplayName', () => {
    it('should extract the component class name', () => {
      const names = [
        createClass({ displayName: 'Foo', render() {} }),
        class Bar extends Component {},
        createClass({ render() {} })
      ].map(getDisplayName);

      expect(names).toEqual(['Foo', 'Bar', 'Component']);
    });
  });
});
