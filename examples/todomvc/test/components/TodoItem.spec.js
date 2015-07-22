import expect from 'expect';
import jsdomReact from '../jsdomReact';
import React from 'react/addons';
import TodoItem from '../../components/TodoItem';
import TodoTextInput from '../../components/TodoTextInput';

const { TestUtils } = React.addons;

function setup(editing=false) {
  let props = {
    todo: {
      id: 0,
      text: 'Use Redux',
      marked: false
    },
    editTodo: expect.createSpy(),
    deleteTodo: expect.createSpy(),
    markTodo: expect.createSpy()
  };

  let renderer = TestUtils.createRenderer();

  renderer.render(
    <TodoItem {...props} />
  );

  let output = renderer.getRenderOutput();

  if (editing) {
    let label = output.props.children.props.children[1];
    label.props.onDoubleClick({});
    output = renderer.getRenderOutput();
  }

  return {
    props: props,
    output: output,
    renderer: renderer
  };
}

describe('components', () => {
  jsdomReact();

  describe('TodoItem', () => {

    it('initial render', () => {
      const { output } = setup();

      expect(output.type).toBe('li');
      expect(output.props.className).toBe('');

      let div = output.props.children;

      expect(div.type).toBe('div');
      expect(div.props.className).toBe('view');

      let [input, label, button] = div.props.children;

      expect(input.type).toBe('input');
      expect(input.props.checked).toBe(false);

      expect(label.type).toBe('label');
      expect(label.props.children).toBe('Use Redux');

      expect(button.type).toBe('button');
      expect(button.props.className).toBe('destroy');
    });

    it('input onChange should call markTodo', () => {
      const { output, props } = setup();
      let input = output.props.children.props.children[0];
      input.props.onChange({});
      expect(props.markTodo).toHaveBeenCalledWith(0);
    });

    it('button onClick should call deleteTodo', () => {
      const { output, props } = setup();
      let button = output.props.children.props.children[2];
      button.props.onClick({});
      expect(props.deleteTodo).toHaveBeenCalledWith(0);
    });

    it('label onDoubleClick should put component in edit state', () => {
      const { output, renderer } = setup();
      let label = output.props.children.props.children[1];
      label.props.onDoubleClick({});
      let updated = renderer.getRenderOutput();
      expect(updated.type).toBe('li');
      expect(updated.props.className).toBe('editing');
    });

    it('edit state render', () => {
      const { output } = setup(true);

      expect(output.type).toBe('li');
      expect(output.props.className).toBe('editing');

      let input = output.props.children;
      expect(input.type).toBe(TodoTextInput);
      expect(input.props.text).toBe('Use Redux');
      expect(input.props.editing).toBe(true);
    });

    it('TodoTextInput onSave should call editTodo', () => {
      const { output, props } = setup(true);
      output.props.children.props.onSave('Use Redux');
      expect(props.editTodo).toHaveBeenCalledWith(0, 'Use Redux');
    });

    it('TodoTextInput onSave should call deleteTodo if text is empty', () => {
      const { output, props } = setup(true);
      output.props.children.props.onSave('');
      expect(props.deleteTodo).toHaveBeenCalledWith(0);
    });

    it('TodoTextInput onSave should exit component from edit state', () => {
      const { output, renderer } = setup(true);
      output.props.children.props.onSave('Use Redux');
      let updated = renderer.getRenderOutput();
      expect(updated.type).toBe('li');
      expect(updated.props.className).toBe('');
    });
  });
});
