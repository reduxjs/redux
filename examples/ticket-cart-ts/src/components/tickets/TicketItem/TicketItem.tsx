import React from 'react'
import Ticket from '../Ticket'

type TicketProp = {
  from: string
  to: string
  price: number
}

interface Props {
  ticket: TicketProp
  onBuy: () => void
}

const TicketItem: React.FC<Props> = ({ ticket, onBuy }) => (
  <div style={{ marginBottom: 20 }} data-testid="ticket-item">
    <Ticket price={ticket.price} from={ticket.from} to={ticket.to} />
    <button onClick={onBuy} data-testid="buy-button">
      Buy
    </button>
  </div>
)

export default TicketItem
