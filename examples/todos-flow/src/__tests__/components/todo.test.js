// @flow

import React from 'react';
import { shallow } from 'enzyme';

import Todo from '../../components/Todo';

const setup = (setupProps = {}) => {
  const defaultProps = {
    text: 'Test todo',
    completed: false,
    onClick: jest.fn()
  };
  const props = { ...defaultProps, ...setupProps };
  const wrapper = shallow(
    <Todo
      text={props.text}
      completed={props.completed}
      onClick={props.onClick}
    />
  );

  return {
    props,
    wrapper
  };
};

describe('Todo', () => {
  test('renders without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  test('puts a line through text when completed', () => {
    const { wrapper } = setup({ completed: true });

    expect(wrapper).toMatchSnapshot();
  });

  test('calls onClick when clicked', () => {
    const { props, wrapper } = setup();
    expect(wrapper).toMatchSnapshot();

    wrapper.find('li').simulate('click');
    expect(props.onClick).toHaveBeenCalled();
  });
});
