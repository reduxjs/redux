import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { createRedux } from '../../src';
import { connect, Connector } from '../../src/react';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('provide', () => {
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

    it('wraps component with Provider', () => {
      const redux = createRedux({ test: () => 'test' });

      @connect(state => state)
      class Container extends Component {
        render() {
          return <div {...this.props} />;
        }
      }

      const container = TestUtils.renderIntoDocument(
        <Provider redux={redux}>
          {() => <Container pass="through" />}
        </Provider>
      );
      const div = TestUtils.findRenderedDOMComponentWithTag(container, 'div');
      expect(div.props.pass).toEqual('through');
      expect(div.props.test).toEqual('test');
      expect(() => TestUtils.findRenderedComponentWithType(container, Connector))
        .toNotThrow();
    });

    it('sets displayName correctly', () => {
      @connect(state => state)
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      expect(Container.displayName).toBe('Connector(Container)');
    });

    it('sets DecoratedComponent to wrapped component', () => {
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      let decorator = connect(state => state);
      let ConnectorDecorator = decorator(Container);

      expect(ConnectorDecorator.DecoratedComponent).toBe(Container);
    });
  });
});
