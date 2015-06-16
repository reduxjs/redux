import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { createRedux } from '../../src';
import { Connector } from '../../src/react';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('Connector', () => {
    jsdomReact();

    // Mock minimal Provider interface
    class Provider extends Component {
      static childContextTypes = {
        redux: PropTypes.object.isRequired
      }

      getChildContext() {
        return { redux: this.props.redux };
      }

      render() {
        return this.props.children();
      }
    }

    const stringBuilder = (prev = '', action) => {
      return action.type === 'APPEND'
        ? prev + action.body
        : prev;
    };

    it('gets Redux from context', () => {
      const redux = createRedux({ test: () => 'test' });

      const tree = TestUtils.renderIntoDocument(
        <Provider redux={redux}>
          {() => (
            <Connector>
              {() => <div />}
            </Connector>
          )}
        </Provider>
      );

      const connector = TestUtils.findRenderedComponentWithType(tree, Connector);
      expect(connector.context.redux).toBe(redux);
    });

    it('subscribes to Redux changes', () => {
      const redux = createRedux({ string: stringBuilder });

      const tree = TestUtils.renderIntoDocument(
        <Provider redux={redux}>
          {() => (
            <Connector select={state => ({ string: state.string })}>
              {({ string }) => <div string={string} />}
            </Connector>
          )}
        </Provider>
      );

      const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(div.props.string).toBe('');
      redux.dispatch({ type: 'APPEND', body: 'a'});
      expect(div.props.string).toBe('a');
      redux.dispatch({ type: 'APPEND', body: 'b'});
      expect(div.props.string).toBe('ab');
    });

    it('unsubscribes before unmounting', () => {
      const redux = createRedux({ test: () => 'test' });
      const subscribe = redux.subscribe;

      // Keep track of unsubscribe by wrapping `subscribe()`
      const spy = expect.createSpy(() => {});
      redux.subscribe = (listener) => {
        const unsubscribe = subscribe(listener);
        return () => {
          spy();
          return unsubscribe();
        };
      };

      const tree = TestUtils.renderIntoDocument(
        <Provider redux={redux}>
          {() => (
            <Connector select={state => ({ string: state.string })}>
              {({ string }) => <div string={string} />}
            </Connector>
          )}
        </Provider>
      );

      const connector = TestUtils.findRenderedComponentWithType(tree, Connector);
      expect(spy.calls.length).toBe(0);
      connector.componentWillUnmount();
      expect(spy.calls.length).toBe(1);
    });

    it('shallow compares selected state to prevent unnecessary updates', () => {
      const redux = createRedux({ string: stringBuilder });
      const spy = expect.createSpy(() => {});
      function render({ string }) {
        spy();
        return <div string={string}/>;
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider redux={redux}>
          {() => (
            <Connector select={state => ({ string: state.string })}>
              {render}
            </Connector>
          )}
        </Provider>
      );

      const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(spy.calls.length).toBe(1);
      expect(div.props.string).toBe('');
      redux.dispatch({ type: 'APPEND', body: 'a'});
      expect(spy.calls.length).toBe(2);
      redux.dispatch({ type: 'APPEND', body: 'b'});
      expect(spy.calls.length).toBe(3);
      redux.dispatch({ type: 'APPEND', body: ''});
      expect(spy.calls.length).toBe(3);
    });

    it('recomputes the state slice when `select` prop changes', () => {
      const redux = createRedux({ a: () => 42, b: () => 72 });

      function selectA(state) {
        return { result: state.a };
      }

      function selectB(state) {
        return { result: state.b };
      }

      function render({ result }) {
        return <div>{result}</div>;
      }

      class Container extends Component {
        constructor() {
          super();
          this.state = { select: selectA };
        }

        render() {
          return (
            <Provider redux={redux}>
              {() =>
                <Connector select={this.state.select}>
                  {render}
                </Connector>
              }
            </Provider>
          );
        }
      }

      let tree = TestUtils.renderIntoDocument(<Container />);
      let div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(div.props.children).toBe(42);

      tree.setState({ select: selectB });
      expect(div.props.children).toBe(72);
    });

    it('passes `dispatch()` to child function', () => {
      const redux = createRedux({ test: () => 'test' });

      const tree = TestUtils.renderIntoDocument(
        <Provider redux={redux}>
          {() => (
            <Connector>
              {({ dispatch }) => <div dispatch={dispatch} />}
            </Connector>
          )}
        </Provider>
      );

      const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(div.props.dispatch).toBe(redux.dispatch);
    });

    it('should throw an error if `state` returns anything but a plain object', () => {
      const redux = createRedux(() => {});

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider redux={redux}>
            {() => (
              <Connector state={() => 1}>
                {() => <div />}
              </Connector>
            )}
          </Provider>
        );
      }).toThrow(/select/);
    });
  });
});
