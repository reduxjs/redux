// @flow

import React from 'react';
import { shallow } from 'enzyme';

import TodoList from '../../components/TodoList';

const setup = (setupProps = {}) => {
  const defaultProps = {
    todos: [],
    onTodoClick: jest.fn()
  };
  const props = { ...defaultProps, ...setupProps };
  const wrapper = shallow(
    <TodoList todos={props.todos} onTodoClick={props.onTodoClick} />
  );

  return {
    props,
    wrapper
  };
};

describe('TodoList', () => {
  test('renders without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  describe('with todos', () => {
    const { wrapper, props } = setup({
      todos: [
        {
          text: 'Test AddTodo',
          completed: false,
          id: 0
        }
      ]
    });

    test('renders a list of todos', () => {
      expect(wrapper).toMatchSnapshot();
    });

    test('todo onClick calls onTodoClick', () => {
      wrapper.find('Todo').simulate('click');
      expect(props.onTodoClick).toHaveBeenCalled();
    });
  });
});
