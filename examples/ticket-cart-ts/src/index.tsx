import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import './index.css'
import App from './containers/App'
import { configureAppStore } from './store'
import { ticketsActions } from './store/tickets'

const store = configureAppStore()

store.dispatch(ticketsActions.loadTickets())

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
)
