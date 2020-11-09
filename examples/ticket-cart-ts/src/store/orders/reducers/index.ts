import { OrdersActionTypes } from '../actionTypes'
import type { OrdersActions } from '../actionTypes'
import type { OrderId, Order } from '../types'

export type OrdersMapById = Record<OrderId, Order>

export type OrdersState = {
  entities: {
    byId: OrdersMapById
    allIds: OrderId[]
  }
}

const initialState: OrdersState = {
  entities: {
    byId: {},
    allIds: []
  }
}

// Simple id generation
let nextOrderId = 1

export function ordersReducer(state = initialState, action: OrdersActions): OrdersState {
  switch (action.type) {
    case OrdersActionTypes.ADD_ORDER: {
      const { ticketId } = action.payload
      const order: Order = {
        id: nextOrderId++,
        ticketId,
        createdAt: Date.now()
      }
      const byId = { ...state.entities.byId, [order.id]: order }
      const allIds = state.entities.allIds.concat(order.id)

      return {
        ...state,
        entities: {
          byId,
          allIds
        }
      }
    }

    case OrdersActionTypes.DELETE_ORDER: {
      const { orderId } = action.payload
      const { [orderId]: value, ...byId } = state.entities.byId
      const allIds = state.entities.allIds.filter(id => id !== orderId)

      return {
        ...state,
        entities: {
          byId,
          allIds
        }
      }
    }

    default:
      return state
  }
}
