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

    it('should replace just the reducer when receiving a new store in props', () => {
      const store1 = createStore((state = 10) => state + 1);
      const store2 = createStore((state = 10) => state * 2);
      const spy = expect.createSpy(() => ({}));

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
