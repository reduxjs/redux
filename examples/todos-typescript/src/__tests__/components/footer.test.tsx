import * as React from 'react';
import { shallow } from 'enzyme';

import Footer from '../../components/Footer';

const setup = (setupProps = {}) => {
  const wrapper = shallow(<Footer />);
  return {
    wrapper
  };
};

describe('Footer', () => {
  test('renders without crashing', () => {
    const { wrapper } = setup();
    expect(wrapper).toMatchSnapshot();
  });
});
