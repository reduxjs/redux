import type { OrderId } from '../types'
import type { TicketId } from '../../tickets/types'

export enum OrdersActionTypes {
  ADD_ORDER = 'ORDERS:ADD',
  DELETE_ORDER = 'ORDERS:DELETE_ORDER'
}

export type AddOrderAction = {
  type: OrdersActionTypes.ADD_ORDER
  payload: {
    ticketId: TicketId
  }
}

export type DeleteOrderAction = {
  type: OrdersActionTypes.DELETE_ORDER
  payload: {
    orderId: OrderId
  }
}

export type OrdersActions = DeleteOrderAction | AddOrderAction
