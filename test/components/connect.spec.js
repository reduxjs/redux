import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { createStore } from 'redux';
import { connect, Connector } from '../../src/index';

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
        TestUtils.findRenderedComponentWithType(container, Connector)
      ).toNotThrow();
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

    it('should pass the only argument as the select prop down', () => {
      const store = createStore(() => ({
        foo: 'baz',
        bar: 'baz'
      }));

      function select({ foo }) {
        return { foo };
      }

      @connect(select)
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
      const connector = TestUtils.findRenderedComponentWithType(container, Connector);
      expect(connector.props.select({
        foo: 5,
        bar: 7
      })).toEqual({
        foo: 5
      });
    });

    it('should set the displayName correctly', () => {
      @connect(state => state)
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      expect(Container.displayName).toBe('Connector(Container)');
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
  });
});
