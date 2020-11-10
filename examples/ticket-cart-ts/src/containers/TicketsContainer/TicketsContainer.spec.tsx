import React from 'react'
import { Store } from 'redux'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureAppStore } from '../../store/configureStore'
import { ticketsActions } from '../../store/tickets'
import { initialState } from '../../store/tickets/reducers'
import TicketsContainer from './TicketsContainer'

const renderOrdersContainer = (store: Store) =>
  render(
    <Provider store={store}>
      <TicketsContainer />
    </Provider>
  )

jest.mock('redux-saga/effects', () => {
  const operators = jest.requireActual('redux-saga/effects')
  const delay = (s: number) =>
    new Promise(res => setTimeout(res, 0))
  return { ...operators, delay }
})

describe('TicketsContainer component', () => {
  let store: ReturnType<typeof configureAppStore>
  let component: ReturnType<typeof renderOrdersContainer>

  beforeEach(() => {
    store = configureAppStore()
    component = renderOrdersContainer(store)
    expect(store.getState().tickets).toEqual(initialState)
    store.dispatch(ticketsActions.loadTickets())
  })

  afterEach(() => {
    component.unmount()
  })

  it('should render components', () => {
    const { container } = component
    expect(container).toMatchSnapshot()
  })

  it('should have empty list of tickets on mount', () => {
    const { queryAllByTestId } = component
    expect(queryAllByTestId('ticket-item')).toHaveLength(0)
  })

  it('should render list of tickets', async () => {
    const { findAllByTestId } = component
    const tickets = await findAllByTestId('ticket-item')

    expect(tickets.length).toBeGreaterThan(2)
  })
})
