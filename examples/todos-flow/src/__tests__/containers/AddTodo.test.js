// @flow

import React from 'react';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';

import AddTodo from '../../containers/AddTodo';

const setup = (setupProps = {}) => {
  const store = configureStore()({ todos: [] });
  const wrapper = shallow(<AddTodo store={store} />);

  return {
    store,
    wrapper
  };
};

describe('AddTodo', () => {
  test('renders without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  test('onSubmit calls preventDefault to stop form submit', () => {
    let preventDefault = jest.fn();
    let { wrapper } = setup();
    let form = wrapper.shallow().shallow().find('form');
    form.simulate('submit', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  test('onSubmit returns early if input.value is not set', () => {
    let { store } = setup();
    expect(store.getActions()).toEqual([]);
  });

  test('onSubmit dispatches action if input.value is set', () => {
    const { store, wrapper } = setup();
    let preventDefault = jest.fn();
    const deeperWrapper = wrapper.shallow();

    deeperWrapper
      .find('input')
      .simulate('change', { target: { value: 'Test todo' } });

    deeperWrapper.find('form').simulate('submit', { preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    expect(store.getActions()).toEqual([
      { id: 0, text: 'Test todo', type: 'ADD_TODO' }
    ]);
  });
});
