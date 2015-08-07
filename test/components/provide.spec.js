import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { createStore } from 'redux';
import { provide, Provider } from '../../src/index';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('provide', () => {
    jsdomReact();

    class Child extends Component {
      static contextTypes = {
        store: PropTypes.object.isRequired
      }

      render() {
        return <div />;
      }
    }

    it('should wrap the component into Provider', () => {
      const store = createStore({});

      @provide(store)
      class Container extends Component {
        render() {
          return <Child {...this.props} />;
        }
      }

      const container = TestUtils.renderIntoDocument(
        <Container pass='through' />
      );
      const child = TestUtils.findRenderedComponentWithType(container, Child);
      expect(child.props.pass).toEqual('through');
      expect(() =>
        TestUtils.findRenderedComponentWithType(container, Provider)
      ).toNotThrow();
      expect(child.context.store).toBe(store);
    });

    it('sets the displayName correctly', () => {
      @provide(createStore({}))
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      expect(Container.displayName).toBe('Provider(Container)');
    });

    it('should expose the wrapped component as DecoratedComponent', () => {
      class Container extends Component {
        render() {
          return <div />;
        }
      }

      const decorator = provide(state => state);
      const decorated = decorator(Container);

      expect(decorated.DecoratedComponent).toBe(Container);
    });
  });
});
