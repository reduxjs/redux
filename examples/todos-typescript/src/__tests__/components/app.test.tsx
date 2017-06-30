import * as React from 'react';
import { shallow } from 'enzyme';

import App from '../../components/App';

const setup = (setupProps = {}) => {
  return {
    wrapper: shallow(<App />)
  };
};

describe('App', () => {
  test('renders without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });
});
