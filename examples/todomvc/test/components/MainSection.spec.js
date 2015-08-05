import expect from 'expect';
import jsdomReact from '../jsdomReact';
import React from 'react/addons';
import MainSection from '../../components/MainSection';
import TodoItem from '../../components/TodoItem';
import Footer from '../../components/Footer';
import { SHOW_ALL, SHOW_MARKED } from '../../constants/TodoFilters';

const { TestUtils } = React.addons;

function setup(propOverrides) {
  let props = Object.assign({
    todos: [{
      text: 'Use Redux',
      marked: false,
      id: 0
    }, {
      text: 'Run the tests',
      marked: true,
      id: 1
    }],
    actions: {
      editTodo: expect.createSpy(),
      deleteTodo: expect.createSpy(),
      markTodo: expect.createSpy(),
      markAll: expect.createSpy(),
      clearMarked: expect.createSpy()
    }
  }, propOverrides);

  let renderer = TestUtils.createRenderer();
  renderer.render(<MainSection {...props} />);
  let output = renderer.getRenderOutput();

  return {
    props: props,
    output: output,
    renderer: renderer
  };
}

describe('components', () => {
  jsdomReact();

  describe('MainSection', () => {

    it('should render container', () => {
      const { output } = setup();
      expect(output.type).toBe('section');
      expect(output.props.className).toBe('main');
    });

    describe('toggle all input', () => {

      it('should render', () => {
        const { output } = setup();
        let [toggle] = output.props.children;
        expect(toggle.type).toBe('input');
        expect(toggle.props.type).toBe('checkbox');
        expect(toggle.props.checked).toBe(false);
      });

      it('should be checked if all todos marked', () => {
        const { output } = setup({ todos: [{
          text: 'Use Redux',
          marked: true,
          id: 0
        }]});
        let [toggle] = output.props.children;
        expect(toggle.props.checked).toBe(true);
      });

      it('should call markAll on change', () => {
        const { output, props } = setup();
        let [toggle] = output.props.children;
        toggle.props.onChange({});
        expect(props.actions.markAll).toHaveBeenCalled();
      });
    });

    describe('footer', () => {

      it('should render', () => {
        const { output } = setup();
        let [,, footer] = output.props.children;
        expect(footer.type).toBe(Footer);
        expect(footer.props.markedCount).toBe(1);
        expect(footer.props.unmarkedCount).toBe(1);
        expect(footer.props.filter).toBe(SHOW_ALL);
      });

      it('onShow should set the filter', () => {
        const { output, renderer } = setup();
        let [,, footer] = output.props.children;
        footer.props.onShow(SHOW_MARKED);
        let updated = renderer.getRenderOutput();
        let [,, updatedFooter] = updated.props.children;
        expect(updatedFooter.props.filter).toBe(SHOW_MARKED);
      });

      it('onClearMarked should call clearMarked', () => {
        const { output, props } = setup();
        let [,, footer] = output.props.children;
        footer.props.onClearMarked();
        expect(props.actions.clearMarked).toHaveBeenCalled();
      });

      it('onClearMarked shouldnt call clearMarked if no todos marked', () => {
        const { output, props } = setup({ todos: [{
          text: 'Use Redux',
          marked: false,
          id: 0
        }]});
        let [,, footer] = output.props.children;
        footer.props.onClearMarked();
        expect(props.actions.clearMarked.calls.length).toBe(0);
      });
    });

    describe('todo list', () => {

      it('should render', () => {
        const { output, props } = setup();
        let [, list] = output.props.children;
        expect(list.type).toBe('ul');
        expect(list.props.children.length).toBe(2);
        list.props.children.forEach((item, i) => {
          expect(item.type).toBe(TodoItem);
          expect(item.props.todo).toBe(props.todos[i]);
        });
      });

      it('should filter items', () => {
        const { output, renderer, props } = setup();
        let [,, footer] = output.props.children;
        footer.props.onShow(SHOW_MARKED);
        let updated = renderer.getRenderOutput();
        let [, updatedList] = updated.props.children;
        expect(updatedList.props.children.length).toBe(1);
        expect(updatedList.props.children[0].props.todo).toBe(props.todos[1]);
      });
    });
  });
});
