import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { createStore, combineReducers } from 'redux';
import { connect } from '../../src/index';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('connect', () => {
    jsdomReact();

    // Mock minimal Provider interface
    class Provider extends Component {
      static childContextTypes = {
        store: PropTypes.object.isRequired
      }

      getChildContext() {
        return { store: this.props.store };
      }

      render() {
        return this.props.children();
      }
    }

    function stringBuilder(prev = '', action) {
      return action.type === 'APPEND'
        ? prev + action.body
        : prev;
    }

    it('should receive the store in the context', () => {
      const store = createStore(() => ({}));

      @connect()
      class Container extends Component {
        render() {
          return <div {...this.props} />;
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <Container pass="through" />
          )}
        </Provider>
      );

      const container = TestUtils.findRenderedComponentWithType(tree, Container);
      expect(container.context.store).toBe(store);
    });

    it('should wrap the component into Provider', () => {
      const store = createStore(() => ({
        foo: 'bar'
      }));

      @connect(state => state)
      class Container extends Component {
        render() {
          return <div {...this.props} />;
        }
      }

      const container = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => <Container pass='through' />}
        </Provider>
      );
      const div = TestUtils.findRenderedDOMComponentWithTag(container, 'div');
      expect(div.props.pass).toEqual('through');
      expect(div.props.foo).toEqual('bar');
      expect(() =>
        TestUtils.findRenderedComponentWithType(container, Container)
      ).toNotThrow();
    });

    it('should subscribe to the store changes', () => {
      const store = createStore(stringBuilder);

      @connect(state => ({string: state}) )
      class Container extends Component {
        render() {
          return <div {...this.props}/>;
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <Container />
          )}
        </Provider>
      );

      const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

      expect(div.props.string).toBe('');
      store.dispatch({ type: 'APPEND', body: 'a'});
      expect(div.props.string).toBe('a');
      store.dispatch({ type: 'APPEND', body: 'b'});
      expect(div.props.string).toBe('ab');
    });

    it('should handle additional prop changes in addition to slice', () => {
      const store = createStore(() => ({
        foo: 'bar'
      }));

      @connect(state => state)
      class ConnectContainer extends Component {
        render() {
          return (
              <div {...this.props} pass={this.props.bar.baz} />
          );
        }
      }

      class Container extends Component {
        constructor() {
          super();
          this.state = {
            bar: {
              baz: ''
            }
          };
        }
        componentDidMount() {

          // Simulate deep object mutation
          this.state.bar.baz = 'through';
          this.setState({
            bar: this.state.bar
          });
        }
        render() {
          return (
            <Provider store={store}>
              {() => <ConnectContainer bar={this.state.bar} />}
             </Provider>
          );
        }
      }

      const container = TestUtils.renderIntoDocument(<Container />);
      const div = TestUtils.findRenderedDOMComponentWithTag(container, 'div');
      expect(div.props.foo).toEqual('bar');
      expect(div.props.pass).toEqual('through');
    });

    it('should allow for merge to incorporate state and prop changes', () => {
      const store = createStore(stringBuilder);

      function doSomething(thing) {
        return {
          type: 'APPEND',
          body: thing
        };
      }

      @connect(
        state => ({stateThing: state}),
        dispatch => ({doSomething: (whatever) => dispatch(doSomething(whatever)) }),
        (stateProps, actionProps, parentProps) => ({
          ...stateProps,
          ...actionProps,
          mergedDoSomething: (thing) => {
            const seed = stateProps.stateThing === '' ? 'HELLO ' : '';
            actionProps.doSomething(seed + thing + parentProps.extra);
          }
        })
      )
      class Container extends Component {
        render() {
          return <div {...this.props}/>;
        };
      }

      class OuterContainer extends Component {
        constructor() {
          super();
          this.state = { extra: 'z' };
        }

        render() {
          return (
            <Provider store={store}>
              {() => <Container extra={this.state.extra} />}
            </Provider>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(<OuterContainer />);
      const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');

      expect(div.props.stateThing).toBe('');
      div.props.mergedDoSomething('a');
      expect(div.props.stateThing).toBe('HELLO az');
      div.props.mergedDoSomething('b');
      expect(div.props.stateThing).toBe('HELLO azbz');
      tree.setState({extra: 'Z'});
      div.props.mergedDoSomething('c');
      expect(div.props.stateThing).toBe('HELLO azbzcZ');
    });

    it('should merge actionProps into DecoratedComponent', () => {
      const store = createStore(() => ({
        foo: 'bar'
      }));

      @connect(
        state => state,
        dispatch => ({ dispatch })
        )
      class Container extends Component {
        render() {
          return <div {...this.props} />;
        }
      }

      const container = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => <Container pass='through' />}
        </Provider>
      );
      const div = TestUtils.findRenderedDOMComponentWithTag(container, 'div');
      expect(div.props.dispatch).toEqual(store.dispatch);
      expect(div.props.foo).toEqual('bar');
      expect(() =>
        TestUtils.findRenderedComponentWithType(container, Container)
      ).toNotThrow();
      const decorated = TestUtils.findRenderedComponentWithType(container, Container);
      expect(decorated.subscribed).toBe(true);
    });

    it('should not subscribe to stores if select argument is null', () => {
      const store = createStore(() => ({
        foo: 'bar'
      }));

      @connect(
        null,
        dispatch => ({ dispatch })
        )
      class Container extends Component {
        render() {
          return <div {...this.props} />;
        }
      }

      const container = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => <Container pass='through' />}
        </Provider>
      );
      const div = TestUtils.findRenderedDOMComponentWithTag(container, 'div');
      expect(div.props.dispatch).toEqual(store.dispatch);
      expect(div.props.foo).toBe(undefined);
      expect(() =>
        TestUtils.findRenderedComponentWithType(container, Container)
      ).toNotThrow();
      const decorated = TestUtils.findRenderedComponentWithType(container, Container);
      expect(decorated.subscribed).toNotBe(true);

    });

    it('should unsubscribe before unmounting', () => {
      const store = createStore(stringBuilder);
      const subscribe = store.subscribe;

      // Keep track of unsubscribe by wrapping subscribe()
      const spy = expect.createSpy(() => ({}));
      store.subscribe = (listener) => {
        const unsubscribe = subscribe(listener);
        return () => {
          spy();
          return unsubscribe();
        };
      };

      @connect(
        state => ({string: state}),
        dispatch => ({ dispatch })
        )
      class Container extends Component {
        render() {
          return <div {...this.props} />;
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <Container />
          )}
        </Provider>
      );

      const connector = TestUtils.findRenderedComponentWithType(tree, Container);
      expect(spy.calls.length).toBe(0);
      connector.componentWillUnmount();
      expect(spy.calls.length).toBe(1);
    });

    it('should shallowly compare the selected state to prevent unnecessary updates', () => {
      const store = createStore(stringBuilder);
      const spy = expect.createSpy(() => ({}));
      function render({ string }) {
        spy();
        return <div string={string}/>;
      }

      @connect(
        state => ({string: state}),
        dispatch => ({ dispatch })
        )
      class Container extends Component {
        render() {
          return render(this.props);
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <Container />
          )}
        </Provider>
      );

      const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(spy.calls.length).toBe(1);
      expect(div.props.string).toBe('');
      store.dispatch({ type: 'APPEND', body: 'a'});
      expect(spy.calls.length).toBe(2);
      store.dispatch({ type: 'APPEND', body: 'b'});
      expect(spy.calls.length).toBe(3);
      store.dispatch({ type: 'APPEND', body: ''});
      expect(spy.calls.length).toBe(3);
    });

    it('should throw an error if select, bindActionCreators, or merge returns anything but a plain object', () => {
      const store = createStore(() => ({}));

      function makeContainer(select, bindActionCreators, merge) {
        return React.createElement(
          @connect(select, bindActionCreators, merge)
          class Container extends Component {
            render() {
              return <div />;
            }
          }
        );
      }

      function AwesomeMap() { }

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => 1, () => ({}), () => ({})) }
          </Provider>
        );
      }).toThrow(/select/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => 'hey', () => ({}), () => ({})) }
          </Provider>
        );
      }).toThrow(/select/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => new AwesomeMap(), () => ({}), () => ({})) }
          </Provider>
        );
      }).toThrow(/select/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => 1, () => ({})) }
          </Provider>
        );
      }).toThrow(/bindActionCreators/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => 'hey', () => ({})) }
          </Provider>
        );
      }).toThrow(/bindActionCreators/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => new AwesomeMap(), () => ({})) }
          </Provider>
        );
      }).toThrow(/bindActionCreators/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => ({}), () => 1) }
          </Provider>
        );
      }).toThrow(/merge/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => ({}), () => 'hey') }
          </Provider>
        );
      }).toThrow(/merge/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => ({}), () => new AwesomeMap()) }
          </Provider>
        );
      }).toThrow(/merge/);
    });

    it('should set the displayName correctly', () => {
      @connect(state => state)
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      expect(Container.displayName).toBe('ConnectDecorator(Container)');
    });

    it('should expose the wrapped component as DecoratedComponent', () => {
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      const decorator = connect(state => state);
      const decorated = decorator(Container);

      expect(decorated.DecoratedComponent).toBe(Container);
    });

    it('should return the instance of the wrapped component for use in calling child methods', () => {
      const store = createStore(() => ({}));

      const someData = {
        some: 'data'
      };

      class Container extends Component {
        someInstanceMethod() {
          return someData;
        }

        render() {
          return <div />;
        }
      }

      const decorator = connect(state => state);
      const Decorated = decorator(Container);

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <Decorated />
          )}
        </Provider>
      );

      const decorated = TestUtils.findRenderedComponentWithType(tree, Decorated);

      expect(() => decorated.someInstanceMethod()).toThrow();
      expect(decorated.getUnderlyingRef().someInstanceMethod()).toBe(someData);
    });
  });
});
