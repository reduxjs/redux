import { createSelector } from 'reselect'
import { RootState } from '../../reducers'

export const getOrdersMapById = (state: RootState) => state.orders.entities.byId
export const getOrdersIds = (state: RootState) => state.orders.entities.allIds

export const getOrders = createSelector(
  [getOrdersMapById, getOrdersIds],
  (ordersMap, ordersIds) => ordersIds.map(orderId => ordersMap[orderId])
)
