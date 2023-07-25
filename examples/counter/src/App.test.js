import React from 'react';
import { createRoot, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';

test('renders learn react link', () => {
  const container = document.createElement('div');
  const root = createRoot(container);

  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  document.body.appendChild(container);

  expect(screen.getByText(/learn/i)).toBeInTheDocument();
});