import expect from 'expect';
import React, { PropTypes } from 'react/addons';
import { createRedux } from '../../src';
import { Provider } from '../../src/react';

const { TestUtils } = React.addons;
const renderer = TestUtils.createRenderer();

describe('React', () => {
  describe('Provider', () => {
    it.skip('adds Redux to child context', () => {
      const redux = createRedux({ test: () => 'test' });

      class Child {
        static contextTypes = {
          redux: PropTypes.object.isRequired
        }

        render() {
          return <div />;
        }
      }

      renderer.render(
        <Provider redux={redux}>
          {() => <Child />}
        </Provider>
      );

      const result = renderer.getRenderOutput();

      expect(result.type).toBe(Child);
    });
  });
});
