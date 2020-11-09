import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import TicketItem from '../../components/tickets/TicketItem'
import TicketsList from '../../components/tickets/TicketsList'
import { getTickets } from '../../store/tickets/selectors'
import type { RootState } from '../../store/reducers'
import type { TicketId } from '../../store/tickets/types'
import { ordersActions } from '../../store/orders'

const TicketsContainer: React.FC = () => {
  const tickets = useSelector((state: RootState) =>
    getTickets(state)
  )

  const dispatch = useDispatch()

  const buyTicket = (ticketId: TicketId) =>
    dispatch(ordersActions.addOrder(ticketId))

  return (
    <TicketsList>
      {tickets.map(ticket => (
        <TicketItem
          key={ticket.id}
          ticket={ticket}
          onBuy={() => buyTicket(ticket.id)}
        />
      ))}
    </TicketsList>
  )
}

export default TicketsContainer
