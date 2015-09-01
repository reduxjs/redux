import expect from 'expect';
import jsdom from 'mocha-jsdom';
import React, { PropTypes, Component } from 'react';
import TestUtils from 'react-addons-test-utils';
import { createStore } from 'redux';
import { Provider } from '../../src/index';
import createProvider from '../../src/components/createProvider';

describe('React', () => {
  describe('Provider', () => {
    jsdom();

    class Child extends Component {
      static contextTypes = {
        store: PropTypes.object.isRequired
      }

      render() {
        return <div />;
      }
    }

    it('should not warn when using child-as-a-function before React 0.14', () => {
      const store = createStore(() => ({}));
      ['0.13.0-beta', '0.13.0', '0.13.3'].forEach(version => {
        const LocalProvider = createProvider({ ...React, version });

        let spy = expect.spyOn(console, 'error');
        const tree = TestUtils.renderIntoDocument(
          <LocalProvider store={store}>
            {() => <Child />}
          </LocalProvider>
        );
        spy.destroy();
        expect(spy.calls.length).toBe(0);

        spy = expect.spyOn(console, 'error');
        tree.forceUpdate();
        spy.destroy();
        expect(spy.calls.length).toBe(0);
      });
    });

    it('should warn once when using a single element before React 0.14', () => {
      const store = createStore(() => ({}));
      ['0.13.0-beta', '0.13.0', '0.13.3', undefined].forEach(version => {
        const LocalProvider = createProvider({ ...React, version });
        // Trick React into checking propTypes every time:
        LocalProvider.displayName = Math.random().toString();

        let spy = expect.spyOn(console, 'error');
        const tree = TestUtils.renderIntoDocument(
          <LocalProvider store={store}>
            <Child />
          </LocalProvider>
        );
        spy.destroy();

        expect(spy.calls.length).toBe(2);
        expect(spy.calls[0].arguments[0]).toMatch(
          /Invalid prop `children` of type `object` supplied to .*, expected `function`./
        );
        expect(spy.calls[1].arguments[0]).toMatch(
          /With React 0.13, you need to wrap <Provider> child into a function. This restriction will be removed with React 0.14./
        );

        spy = expect.spyOn(console, 'error');
        tree.forceUpdate();
        spy.destroy();
        expect(spy.calls.length).toBe(0);
      });
    });

    it('should warn once when using child-as-a-function after React 0.14', () => {
      const store = createStore(() => ({}));
      ['0.14.0-beta3', '0.14.0', '0.14.2', '0.15.0-beta', '1.0.0-beta', '1.0.0'].forEach(version => {
        const LocalProvider = createProvider({ ...React, version });
        // Trick React into checking propTypes every time:
        LocalProvider.displayName = Math.random().toString();

        let spy = expect.spyOn(console, 'error');
        const tree = TestUtils.renderIntoDocument(
          <LocalProvider store={store}>
            {() => <Child />}
          </LocalProvider>
        );
        spy.destroy();

        expect(spy.calls.length).toBe(2);
        expect(spy.calls[0].arguments[0]).toMatch(
          /Invalid prop `children` supplied to .*, expected a single ReactElement./
        );
        expect(spy.calls[1].arguments[0]).toMatch(
          /With React 0.14 and later versions, you no longer need to wrap <Provider> child into a function./
        );

        spy = expect.spyOn(console, 'error');
        tree.forceUpdate();
        spy.destroy();
        expect(spy.calls.length).toBe(0);
      });
    });

    it('should enforce a single child', () => {
      const store = createStore(() => ({}));

      expect(() => TestUtils.renderIntoDocument(
        <Provider store={store}>
          <div />
        </Provider>
      )).toNotThrow();

      expect(() => TestUtils.renderIntoDocument(
        <Provider store={store}>
        </Provider>
      )).toThrow(/exactly one child/);

      expect(() => TestUtils.renderIntoDocument(
        <Provider store={store}>
          <div />
          <div />
        </Provider>
      )).toThrow(/exactly one child/);
    });

    it('should enforce a single child when using function-as-a-child', () => {
      const store = createStore(() => ({}));

      expect(() => TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => <div />}
        </Provider>
      )).toNotThrow();

      expect(() => TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => {}}
        </Provider>
      )).toThrow(/exactly one child/);
    });

    it('should add the store to the child context', () => {
      const store = createStore(() => ({}));

      const spy = expect.spyOn(console, 'error');
      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Child />
        </Provider>
      );
      spy.destroy();
      expect(spy.calls.length).toBe(0);

      const child = TestUtils.findRenderedComponentWithType(tree, Child);
      expect(child.context.store).toBe(store);
    });

    it('should add the store to the child context with function-as-a-child', () => {
      const store = createStore(() => ({}));

      const spy = expect.spyOn(console, 'error');
      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => <Child />}
        </Provider>
      );
      spy.destroy();
      expect(spy.calls.length).toBe(0);

      const child = TestUtils.findRenderedComponentWithType(tree, Child);
      expect(child.context.store).toBe(store);
    });

    it('should warn once when receiving a new store in props', () => {
      const store1 = createStore((state = 10) => state + 1);
      const store2 = createStore((state = 10) => state * 2);
      const store3 = createStore((state = 10) => state * state);

      class ProviderContainer extends Component {
        state = { store: store1 };

        render() {
          return (
            <Provider store={this.state.store}>
              <Child />
            </Provider>
          );
        }
      }

      const container = TestUtils.renderIntoDocument(<ProviderContainer />);
      const child = TestUtils.findRenderedComponentWithType(container, Child);
      expect(child.context.store.getState()).toEqual(11);

      let spy = expect.spyOn(console, 'error');
      container.setState({ store: store2 });
      spy.destroy();

      expect(child.context.store.getState()).toEqual(11);
      expect(spy.calls.length).toBe(1);
      expect(spy.calls[0].arguments[0]).toBe(
        '<Provider> does not support changing `store` on the fly. ' +
        'It is most likely that you see this error because you updated to ' +
        'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' +
        'automatically. See https://github.com/rackt/react-redux/releases/' +
        'tag/v2.0.0 for the migration instructions.'
      );

      spy = expect.spyOn(console, 'error');
      container.setState({ store: store3 });
      spy.destroy();

      expect(child.context.store.getState()).toEqual(11);
      expect(spy.calls.length).toBe(0);
    });
  });
});
