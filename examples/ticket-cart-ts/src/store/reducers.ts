import { combineReducers } from 'redux'
import { ticketsReducer } from './tickets'
import type { TicketsState } from './tickets'
import { ordersReducer } from './orders'
import type { OrdersState } from './orders'

export type RootState = {
  tickets: TicketsState
  orders: OrdersState
}

export const rootReducer = combineReducers({
  tickets: ticketsReducer,
  orders: ordersReducer
})
