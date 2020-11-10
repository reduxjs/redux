import React from 'react'
import { Store } from 'redux'
import { render, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureAppStore } from '../../store/configureStore'
import { ticketsActions } from '../../store/tickets'
import { initialState as initialTicketsState } from '../../store/tickets/reducers'
import { initialState as initialOrdersState } from '../../store/orders/reducers'
import App from './App'

const renderOrdersContainer = (store: Store) =>
  render(
    <Provider store={store}>
      <App />
    </Provider>
  )

jest.mock('redux-saga/effects', () => {
  const operators = jest.requireActual('redux-saga/effects')
  const delay = (s: number) => new Promise(res => setTimeout(res, 0))
  return { ...operators, delay }
})

describe('App component', () => {
  let store: ReturnType<typeof configureAppStore>
  let component: ReturnType<typeof renderOrdersContainer>

  beforeEach(() => {
    store = configureAppStore()
    component = renderOrdersContainer(store)
    expect(store.getState().tickets).toEqual(initialTicketsState)
    expect(store.getState().orders).toEqual(initialOrdersState)
    store.dispatch(ticketsActions.loadTickets())
  })

  afterEach(() => {
    component.unmount()
  })

  it('should render components', () => {
    const { container } = component
    expect(container).toMatchSnapshot()
  })

  describe('orders', () => {
    it('should add order', async () => {
      const { queryAllByTestId, findAllByTestId } = component

      expect(queryAllByTestId('order-item')).toHaveLength(0)

      const [ticketButton] = await findAllByTestId('buy-button')
      fireEvent.click(ticketButton)

      expect(queryAllByTestId('order-item')).toHaveLength(1)
    })

    it('should delete order', async () => {
      const { queryAllByTestId, findAllByTestId } = component

      const [ticketButton] = await findAllByTestId('buy-button')
      fireEvent.click(ticketButton)

      const [deleteOrderButton] = await findAllByTestId('delete-button')
      fireEvent.click(deleteOrderButton)

      expect(queryAllByTestId('order-item')).toHaveLength(0)
    })
  })
})
