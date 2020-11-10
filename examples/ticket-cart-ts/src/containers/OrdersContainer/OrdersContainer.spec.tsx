import React from 'react'
import { Store } from 'redux'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureAppStore } from '../../store/configureStore'
import { ticketsActions } from '../../store/tickets'
import { ordersActions } from '../../store/orders'
import { initialState } from '../../store/orders/reducers'
import OrdersContainer from './OrdersContainer'

const renderOrdersContainer = (store: Store) =>
  render(
    <Provider store={store}>
      <OrdersContainer />
    </Provider>
  )

jest.mock('redux-saga/effects', () => {
  const operators = jest.requireActual('redux-saga/effects')
  const delay = jest.fn(() => (s: number) => s)
  return { ...operators, delay }
})

describe('OrdersContainer component', () => {
  let store: ReturnType<typeof configureAppStore>
  let component: ReturnType<typeof renderOrdersContainer>

  beforeEach(() => {
    store = configureAppStore()
    component = renderOrdersContainer(store)
    store.dispatch(ticketsActions.loadTickets())
    expect(store.getState().orders).toEqual(initialState)
  })

  afterEach(() => {
    component.unmount()
  })

  it('should render components', () => {
    const { container } = component
    expect(container).toMatchSnapshot()
  })

  it('should have empty list on mount', () => {
    const { queryAllByTestId } = component
    expect(queryAllByTestId('order-item')).toHaveLength(0)
  })

  it("shouldn't fetch repos on mount if username is empty", async () => {
    store.dispatch(ordersActions.addOrder(1))

    const { queryAllByTestId } = component

    expect(queryAllByTestId('order-item')).toHaveLength(1)
  })
})
