import { createSelector } from 'reselect'
import { getOrders } from './orders/selectors'
import { getTicketsMapById } from './tickets/selectors'

export const getOrdersWithTicketData = createSelector(
  [getTicketsMapById, getOrders],
  (ticketsMapById, orders) =>
    orders.map(order => {
      const { from, to, price } = ticketsMapById[order.ticketId]

      return {
        ...order,
        from,
        to,
        price
      }
    })
)
