import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { createRedux } from '../../src';
import { Provider } from '../../src/react';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('Provider', () => {
    jsdomReact();

    class Child extends Component {
      static contextTypes = {
        redux: PropTypes.object.isRequired
      }

      render() {
        return <div />;
      }
    }

    it('adds Redux to child context', () => {
      const redux = createRedux({ test: () => 'test' });

      const tree = TestUtils.renderIntoDocument(
        <Provider redux={redux}>
          {() => <Child />}
        </Provider>
      );

      const child = TestUtils.findRenderedComponentWithType(tree, Child);
      expect(child.context.redux).toBe(redux);
    });

    it('does not lose subscribers when receiving new props', () => {
      const redux1 = createRedux({ test: () => 'test' });
      const redux2 = createRedux({ test: () => 'test' });
      const spy = expect.createSpy(() => {});

      class ProviderContainer extends Component {
        state = { redux: redux1 };

        render() {
          return (
            <Provider redux={this.state.redux}>
              {() => <Child />}
            </Provider>
          );
        }
      }

      const container = TestUtils.renderIntoDocument(<ProviderContainer />);
      const child = TestUtils.findRenderedComponentWithType(container, Child);

      child.context.redux.subscribe(spy);
      child.context.redux.dispatch({});
      expect(spy.calls.length).toEqual(1);

      container.setState({ redux: redux2 });
      expect(spy.calls.length).toEqual(2);
      child.context.redux.dispatch({});
      expect(spy.calls.length).toEqual(3);
    });
  });
});
