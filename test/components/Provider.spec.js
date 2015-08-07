import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { createStore } from 'redux';
import { Provider } from '../../src/index';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('Provider', () => {
    jsdomReact();

    class Child extends Component {
      static contextTypes = {
        store: PropTypes.object.isRequired
      }

      render() {
        return <div />;
      }
    }

    it('should add the store to the child context', () => {
      const store = createStore(() => ({}));

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => <Child />}
        </Provider>
      );

      const child = TestUtils.findRenderedComponentWithType(tree, Child);
      expect(child.context.store).toBe(store);
    });

    it('should replace just the reducer when receiving a new store in props', () => {
      const store1 = createStore((state = 10) => state + 1);
      const store2 = createStore((state = 10) => state * 2);
      const spy = expect.createSpy(() => ({}));

      class ProviderContainer extends Component {
        state = { store: store1 };

        render() {
          return (
            <Provider store={this.state.store}>
              {() => <Child />}
            </Provider>
          );
        }
      }

      const container = TestUtils.renderIntoDocument(<ProviderContainer />);
      const child = TestUtils.findRenderedComponentWithType(container, Child);
      expect(child.context.store.getState()).toEqual(11);

      child.context.store.subscribe(spy);
      child.context.store.dispatch({});
      expect(spy.calls.length).toEqual(1);
      expect(child.context.store.getState()).toEqual(12);

      container.setState({ store: store2 });
      expect(spy.calls.length).toEqual(2);
      expect(child.context.store.getState()).toEqual(24);

      child.context.store.dispatch({});
      expect(spy.calls.length).toEqual(3);
      expect(child.context.store.getState()).toEqual(48);
    });
  });
});
