import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { createClass, PropTypes, Component } from 'react/addons';
import { createStore } from 'redux';
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

    it('should pass state and props to the given component', () => {
      const store = createStore(() => ({
        foo: 'bar',
        baz: 42,
        hello: 'world'
      }));

      @connect(({ foo, baz }) => ({ foo, baz }))
      class Container extends Component {
        render() {
          return <div {...this.props} />;
        }
      }

      const container = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => <Container pass='through' baz={50} />}
        </Provider>
      );
      const div = TestUtils.findRenderedDOMComponentWithTag(container, 'div');
      expect(div.props.pass).toEqual('through');
      expect(div.props.foo).toEqual('bar');
      expect(div.props.baz).toEqual(42);
      expect(div.props.hello).toEqual(undefined);
      expect(() =>
        TestUtils.findRenderedComponentWithType(container, Container)
      ).toNotThrow();
    });

    it('should subscribe to the store changes', () => {
      const store = createStore(stringBuilder);

      @connect(state => ({ string: state }) )
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

    it('should handle dispatches before componentDidMount', () => {
      const store = createStore(stringBuilder);

      @connect(state => ({ string: state }) )
      class Container extends Component {
        componentWillMount() {
          store.dispatch({ type: 'APPEND', body: 'a'});
        }

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
      expect(div.props.string).toBe('a');
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
          this.setState({
            bar: Object.assign({}, this.state.bar, { baz: 'through' })
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

    it('should remove undefined props', () => {
      const store = createStore(() => ({}));
      let props = { x: true };
      let container;

      @connect(() => ({}), () => ({}))
      class ConnectContainer extends Component {
        render() {
          return (
              <div {...this.props} />
          );
        }
      }

      class HolderContainer extends Component {
        render() {
          return (
            <ConnectContainer {...props} />
          );
        }
      }

      TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <HolderContainer ref={instance => container = instance} />
          )}
        </Provider>
      );

      const propsBefore = {
        ...TestUtils.findRenderedDOMComponentWithTag(container, 'div').props
      };

      props = {};
      container.forceUpdate();

      const propsAfter = {
        ...TestUtils.findRenderedDOMComponentWithTag(container, 'div').props
      };

      expect(propsBefore.x).toEqual(true);
      expect('x' in propsAfter).toEqual(false, 'x prop must be removed');
    });

    it('should remove undefined props without mapDispatch', () => {
      const store = createStore(() => ({}));
      let props = { x: true };
      let container;

      @connect(() => ({}))
      class ConnectContainer extends Component {
        render() {
          return (
              <div {...this.props} />
          );
        }
      }

      class HolderContainer extends Component {
        render() {
          return (
            <ConnectContainer {...props} />
          );
        }
      }

      TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <HolderContainer ref={instance => container = instance} />
          )}
        </Provider>
      );

      const propsBefore = {
        ...TestUtils.findRenderedDOMComponentWithTag(container, 'div').props
      };

      props = {};
      container.forceUpdate();

      const propsAfter = {
        ...TestUtils.findRenderedDOMComponentWithTag(container, 'div').props
      };

      expect(propsBefore.x).toEqual(true);
      expect('x' in propsAfter).toEqual(false, 'x prop must be removed');
    });

    it('should ignore deep mutations in props', () => {
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
      expect(div.props.pass).toEqual('');
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
        dispatch => ({
          doSomething: (whatever) => dispatch(doSomething(whatever))
        }),
        (stateProps, actionProps, parentProps) => ({
          ...stateProps,
          ...actionProps,
          mergedDoSomething(thing) {
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

    it('should merge actionProps into WrappedComponent', () => {
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
      expect(decorated.isSubscribed()).toBe(true);
    });

    it('should not invoke mapState when props change if it only has one argument', () => {
      const store = createStore(stringBuilder);

      let invocationCount = 0;

      @connect(() => {
        invocationCount++;
        return {};
      })
      class WithoutProps extends Component {
        render() {
          return <div {...this.props}/>;
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super();
          this.state = { foo: 'FOO' };
        }

        setFoo(foo) {
          this.setState({ foo });
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <OuterComponent ref='outerComponent' />
          )}
        </Provider>
      );

      tree.refs.outerComponent.setFoo('BAR');
      tree.refs.outerComponent.setFoo('DID');

      expect(invocationCount).toEqual(2);
    });

    it('should invoke mapState every time props are changed if it has a second argument', () => {
      const store = createStore(stringBuilder);

      let propsPassedIn;
      let invocationCount = 0;

      @connect((state, props) => {
        invocationCount++;
        propsPassedIn = props;
        return {};
      })
      class WithProps extends Component {
        render() {
          return <div {...this.props}/>;
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super();
          this.state = { foo: 'FOO' };
        }

        setFoo(foo) {
          this.setState({ foo });
        }

        render() {
          return (
            <div>
              <WithProps {...this.state} />
            </div>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <OuterComponent ref='outerComponent' />
          )}
        </Provider>
      );

      tree.refs.outerComponent.setFoo('BAR');
      tree.refs.outerComponent.setFoo('BAZ');

      expect(invocationCount).toEqual(4);
      expect(propsPassedIn).toEqual({
        foo: 'BAZ'
      });
    });

    it('should not invoke mapDispatch when props change if it only has one argument', () => {
      const store = createStore(stringBuilder);

      let invocationCount = 0;

      @connect(null, () => {
        invocationCount++;
        return {};
      })
      class WithoutProps extends Component {
        render() {
          return <div {...this.props}/>;
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super();
          this.state = { foo: 'FOO' };
        }

        setFoo(foo) {
          this.setState({ foo });
        }

        render() {
          return (
            <div>
              <WithoutProps {...this.state} />
            </div>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <OuterComponent ref='outerComponent' />
          )}
        </Provider>
      );

      tree.refs.outerComponent.setFoo('BAR');
      tree.refs.outerComponent.setFoo('DID');

      expect(invocationCount).toEqual(1);
    });

    it('should invoke mapDispatch every time props are changed if it has a second argument', () => {
      const store = createStore(stringBuilder);

      let propsPassedIn;
      let invocationCount = 0;

      @connect(null, (dispatch, props) => {
        invocationCount++;
        propsPassedIn = props;
        return {};
      })
      class WithProps extends Component {
        render() {
          return <div {...this.props}/>;
        }
      }

      class OuterComponent extends Component {
        constructor() {
          super();
          this.state = { foo: 'FOO' };
        }

        setFoo(foo) {
          this.setState({ foo });
        }

        render() {
          return (
            <div>
              <WithProps {...this.state} />
            </div>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => (
            <OuterComponent ref='outerComponent' />
          )}
        </Provider>
      );

      tree.refs.outerComponent.setFoo('BAR');
      tree.refs.outerComponent.setFoo('BAZ');

      expect(invocationCount).toEqual(3);
      expect(propsPassedIn).toEqual({
        foo: 'BAZ'
      });
    });

    it('should pass dispatch and avoid subscription if arguments are falsy', () => {
      const store = createStore(() => ({
        foo: 'bar'
      }));

      function runCheck(...connectArgs) {
        @connect(...connectArgs)
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
        expect(div.props.pass).toEqual('through');
        expect(() =>
          TestUtils.findRenderedComponentWithType(container, Container)
        ).toNotThrow();
        const decorated = TestUtils.findRenderedComponentWithType(container, Container);
        expect(decorated.isSubscribed()).toBe(false);
      }

      runCheck();
      runCheck(null, null, null);
      runCheck(false, false, false);
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
        state => ({ string: state }),
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

    it('should shallowly compare the merged state to prevent unnecessary updates', () => {
      const store = createStore(stringBuilder);
      const spy = expect.createSpy(() => ({}));
      function render({ string, pass }) {
        spy();
        return <div string={string} pass={pass} passVal={pass.val} />;
      }

      @connect(
        state => ({ string: state }),
        dispatch => ({ dispatch }),
        (stateProps, dispatchProps, parentProps) => ({
          ...dispatchProps,
          ...stateProps,
          ...parentProps
        })
      )
      class Container extends Component {
        render() {
          return render(this.props);
        }
      }

      class Root extends Component {
        constructor(props) {
          super(props);
          this.state = { pass: '' };
        }

        render() {
          return (
            <Provider store={store}>
              {() => (
                <Container pass={this.state.pass} />
              )}
            </Provider>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(<Root />);
      const div = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(spy.calls.length).toBe(1);
      expect(div.props.string).toBe('');
      expect(div.props.pass).toBe('');

      store.dispatch({ type: 'APPEND', body: 'a'});
      expect(spy.calls.length).toBe(2);
      expect(div.props.string).toBe('a');
      expect(div.props.pass).toBe('');

      tree.setState({ pass: '' });
      expect(spy.calls.length).toBe(2);
      expect(div.props.string).toBe('a');
      expect(div.props.pass).toBe('');

      tree.setState({ pass: 'through' });
      expect(spy.calls.length).toBe(3);
      expect(div.props.string).toBe('a');
      expect(div.props.pass).toBe('through');

      tree.setState({ pass: 'through' });
      expect(spy.calls.length).toBe(3);
      expect(div.props.string).toBe('a');
      expect(div.props.pass).toBe('through');

      const obj = { prop: 'val' };
      tree.setState({ pass: obj });
      expect(spy.calls.length).toBe(4);
      expect(div.props.string).toBe('a');
      expect(div.props.pass).toBe(obj);

      tree.setState({ pass: obj });
      expect(spy.calls.length).toBe(4);
      expect(div.props.string).toBe('a');
      expect(div.props.pass).toBe(obj);

      const obj2 = Object.assign({}, obj, { val: 'otherval' });
      tree.setState({ pass: obj2 });
      expect(spy.calls.length).toBe(5);
      expect(div.props.string).toBe('a');
      expect(div.props.pass).toBe(obj2);

      obj2.val = 'mutation';
      tree.setState({ pass: obj2 });
      expect(spy.calls.length).toBe(5);
      expect(div.props.string).toBe('a');
      expect(div.props.passVal).toBe('otherval');
    });

    it('should throw an error if mapState, mapDispatch, or mergeProps returns anything but a plain object', () => {
      const store = createStore(() => ({}));

      function makeContainer(mapState, mapDispatch, mergeProps) {
        return React.createElement(
          @connect(mapState, mapDispatch, mergeProps)
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
      }).toThrow(/mapState/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => 'hey', () => ({}), () => ({})) }
          </Provider>
        );
      }).toThrow(/mapState/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => new AwesomeMap(), () => ({}), () => ({})) }
          </Provider>
        );
      }).toThrow(/mapState/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => 1, () => ({})) }
          </Provider>
        );
      }).toThrow(/mapDispatch/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => 'hey', () => ({})) }
          </Provider>
        );
      }).toThrow(/mapDispatch/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => new AwesomeMap(), () => ({})) }
          </Provider>
        );
      }).toThrow(/mapDispatch/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => ({}), () => 1) }
          </Provider>
        );
      }).toThrow(/mergeProps/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => ({}), () => 'hey') }
          </Provider>
        );
      }).toThrow(/mergeProps/);

      expect(() => {
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            { () => makeContainer(() => ({}), () => ({}), () => new AwesomeMap()) }
          </Provider>
        );
      }).toThrow(/mergeProps/);
    });

    it('should recalculate the state and rebind the actions on hot update', () => {
      const store = createStore(() => {});

      @connect(
        null,
        () => ({ scooby: 'doo' })
      )
      class ContainerBefore extends Component {
        render() {
          return (
              <div {...this.props} />
          );
        }
      }

      @connect(
        () => ({ foo: 'baz' }),
        () => ({ scooby: 'foo' })
      )
      class ContainerAfter extends Component {
        render() {
          return (
              <div {...this.props} />
          );
        }
      }

      @connect(
        () => ({ foo: 'bar' }),
        () => ({ scooby: 'boo' })
      )
      class ContainerNext extends Component {
        render() {
          return (
              <div {...this.props} />
          );
        }
      }

      let container;
      TestUtils.renderIntoDocument(
        <Provider store={store}>
          {() => <ContainerBefore ref={instance => container = instance} />}
         </Provider>
      );
      const div = TestUtils.findRenderedDOMComponentWithTag(container, 'div');
      expect(div.props.foo).toEqual(undefined);
      expect(div.props.scooby).toEqual('doo');

      function imitateHotReloading(TargetClass, SourceClass) {
        // Crude imitation of hot reloading that does the job
        Object.keys(SourceClass.prototype).filter(key =>
          typeof SourceClass.prototype[key] === 'function'
        ).forEach(key => {
          if (key !== 'render') {
            TargetClass.prototype[key] = SourceClass.prototype[key];
          }
        });
        container.forceUpdate();
      }

      imitateHotReloading(ContainerBefore, ContainerAfter);
      expect(div.props.foo).toEqual('baz');
      expect(div.props.scooby).toEqual('foo');

      imitateHotReloading(ContainerBefore, ContainerNext);
      expect(div.props.foo).toEqual('bar');
      expect(div.props.scooby).toEqual('boo');
    });

    it('should set the displayName correctly', () => {
      expect(connect(state => state)(
        class Foo extends Component {
          render() {
            return <div />;
          }
        }
      ).displayName).toBe('Connect(Foo)');

      expect(connect(state => state)(
        createClass({
          displayName: 'Bar',
          render() {
            return <div />;
          }
        })
      ).displayName).toBe('Connect(Bar)');

      expect(connect(state => state)(
        createClass({
          render() {
            return <div />;
          }
        })
      ).displayName).toBe('Connect(Component)');
    });

    it('should expose the wrapped component as WrappedComponent', () => {
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      const decorator = connect(state => state);
      const decorated = decorator(Container);

      expect(decorated.WrappedComponent).toBe(Container);
    });

    it('should use the store from the props instead of from the context if present', () => {
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      let actualState;

      const expectedState = { foos: {} };
      const decorator = connect(state => {
        actualState = state;
        return {};
      });
      const Decorated = decorator(Container);
      const mockStore = {
        dispatch: () => {},
        subscribe: () => {},
        getState: () => expectedState
      };

      TestUtils.renderIntoDocument(<Decorated store={mockStore} />);

      expect(actualState).toEqual(expectedState);
    });

    it('should throw an error if the store is not in the props or context', () => {
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      const decorator = connect(() => {});
      const Decorated = decorator(Container);
      const expectedError =
        `Invariant Violation: Could not find "store" in either the context ` +
        `or props of "Connect(Container)". Either wrap the root component in a ` +
        `<Provider>, or explicitly pass "store" as a prop to "Connect(Container)".`;

      expect(() => TestUtils.renderIntoDocument(<Decorated />)).toThrow(e => {
        expect(e.message).toEqual(expectedError);
        return true;
      });
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
      expect(decorated.getWrappedInstance().someInstanceMethod()).toBe(someData);
      expect(decorated.refs.wrappedInstance.someInstanceMethod()).toBe(someData);
    });
  });
});
