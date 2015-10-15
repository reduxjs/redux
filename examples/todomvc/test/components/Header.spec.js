import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Header from '../../components/Header';
import TodoTextInput from '../../components/TodoTextInput';

function setup() {
  const props = {
    addTodo: expect.createSpy()
  };

  const renderer = TestUtils.createRenderer();
  renderer.render(<Header {...props} />);
  const output = renderer.getRenderOutput();

  return {
    props: props,
    output: output,
    renderer: renderer
  };
}

describe('components', () => {
  describe('Header', () => {
    it('should render correctly', () => {
      const { output } = setup();

      expect(output.type).toBe('header');
      expect(output.props.className).toBe('header');

      const [h1, input] = output.props.children;

      expect(h1.type).toBe('h1');
      expect(h1.props.children).toBe('todos');

      expect(input.type).toBe(TodoTextInput);
      expect(input.props.newTodo).toBe(true);
      expect(input.props.placeholder).toBe('What needs to be done?');
    });

    it('should call call addTodo if length of text is greater than 0', () => {
      const { output, props } = setup();
      const input = output.props.children[1];
      input.props.onSave('');
      expect(props.addTodo.calls.length).toBe(0);
      input.props.onSave('Use Redux');
      expect(props.addTodo.calls.length).toBe(1);
    });
  });
});
