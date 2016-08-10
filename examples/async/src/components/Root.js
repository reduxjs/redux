import React, { PropTypes } from 'react';
import { Provider } from 'react-redux'
import App from './App'

export default function Root({ store }) {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
