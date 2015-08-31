import expect from 'expect';
import jsdomReact from '../jsdomReact';
import React from 'react/addons';
import { Provider } from 'react-redux';
import App from '../../containers/App';
import configureStore from '../../store/configureStore';

const { TestUtils } = React.addons;

function setup(initialState) {
  const store = configureStore(initialState);
  const app = TestUtils.renderIntoDocument(
    <Provider store={store}>
      {() => <App />}
    </Provider>
  );
  return {
    app: app,
    buttons: TestUtils.scryRenderedDOMComponentsWithTag(app, 'button').map(button => {
      return button.getDOMNode();
    }),
    p: TestUtils.findRenderedDOMComponentWithTag(app, 'p').getDOMNode()
  };
}

describe('containers', () => {
  jsdomReact();

  describe('App', () => {
    it('should display initial count', () => {
      const { p } = setup();
      expect(p.textContent).toMatch(/^Clicked: 0 times/);
    });

    it('should display updated count after increment button click', () => {
      const { buttons, p } = setup();
      TestUtils.Simulate.click(buttons[0]);
      expect(p.textContent).toMatch(/^Clicked: 1 times/);
    });

    it('should display updated count after descrement button click', () => {
      const { buttons, p } = setup();
      TestUtils.Simulate.click(buttons[1]);
      expect(p.textContent).toMatch(/^Clicked: -1 times/);
    });

    it('shouldnt change if even and if odd button clicked', () => {
      const { buttons, p } = setup();
      TestUtils.Simulate.click(buttons[2]);
      expect(p.textContent).toMatch(/^Clicked: 0 times/);
    });

    it('should change if odd and if odd button clicked', () => {
      const { buttons, p } = setup({ counter: 1 });
      TestUtils.Simulate.click(buttons[2]);
      expect(p.textContent).toMatch(/^Clicked: 2 times/);
    });
  });
});
