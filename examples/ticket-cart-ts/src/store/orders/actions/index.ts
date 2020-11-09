import { OrdersActionTypes } from '../actionTypes'
import { OrderId } from '../types'
import type { AddOrderAction, DeleteOrderAction } from '../actionTypes'
import type { TicketId } from '../../tickets/types'

function addOrder(ticketId: TicketId): AddOrderAction {
  return {
    type: OrdersActionTypes.ADD_ORDER,
    payload: {
      ticketId
    }
  }
}

function deleteOrder(orderId: OrderId): DeleteOrderAction {
  return {
    type: OrdersActionTypes.DELETE_ORDER,
    payload: {
      orderId
    }
  }
}

export const ordersActions = {
  addOrder,
  deleteOrder
}
