// @flow

import React from 'react';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';

import App from '../../components/App';

const setup = (setupProps = {}) => {
  const store = configureStore()();
  const wrapper = shallow(<App store={store} />);

  return {
    store,
    wrapper
  };
};

describe('App', () => {
  test('renders without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });
});
