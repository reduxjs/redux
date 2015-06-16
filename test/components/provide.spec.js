import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { createRedux } from '../../src';
import { provide, Provider } from '../../src/react';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('provide', () => {
    jsdomReact();

    class Child extends Component {
      static contextTypes = {
        redux: PropTypes.object.isRequired
      }

      render() {
        return <div />;
      }
    }

    it('wraps component with Provider', () => {
      const redux = createRedux({ test: () => 'test' });

      @provide(redux)
      class Container extends Component {
        render() {
          return <Child {...this.props} />;
        }
      }

      const container = TestUtils.renderIntoDocument(<Container pass="through" />);
      const child = TestUtils.findRenderedComponentWithType(container, Child);
      expect(child.props.pass).toEqual('through');
      expect(() => TestUtils.findRenderedComponentWithType(container, Provider))
        .toNotThrow();
      expect(child.context.redux).toBe(redux);
    });

    it('sets displayName correctly', () => {
      @provide(createRedux({ test: () => 'test' }))
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      expect(Container.displayName).toBe('Provider(Container)');
    });

    it('sets DecoratedComponent to wrapped component', () => {
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      let decorator = provide(state => state);
      let ProviderDecorator = decorator(Container);

      expect(ProviderDecorator.DecoratedComponent).toBe(Container);
    });
  });
});
