import expect from 'expect';
import jsdom from 'mocha-jsdom';
import React, { PropTypes, Component } from 'react/addons';
import { createRedux } from '../../src';
import { Provider } from '../../src/react';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('Provider', () => {
    jsdom();

    it('adds Redux to child context', () => {
      const redux = createRedux({ test: () => 'test' });

      class Child extends Component {
        static contextTypes = {
          redux: PropTypes.object.isRequired
        }

        render() {
          return <div />;
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider redux={redux}>
          {() => <Child />}
        </Provider>
      );

      const child = TestUtils.findRenderedComponentWithType(tree, Child);
      expect(child.context.redux).toBe(redux);
    });
  });
});
