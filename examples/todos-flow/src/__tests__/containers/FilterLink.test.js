// @flow

import React from 'react';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';

import FilterLink from '../../containers/FilterLink';
import { setVisibilityFilter } from '../../actions/visibilityFilter';

const setup = (setupProps = {}) => {
  const store = configureStore()({});
  const wrapper = shallow(<FilterLink filter="SHOW_ALL" store={store} />);

  return {
    store,
    wrapper
  };
};

describe('FilterLink', () => {
  test('renders without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });

  test('sets the correct filter when clicked', () => {
    const { store, wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
    expect(store.getActions()).toEqual([]);
    wrapper.find('Link').simulate('click');
    expect(store.getActions()).toEqual([setVisibilityFilter('SHOW_ALL')]);
  });
});
