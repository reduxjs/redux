import React from 'react'
import Ticket from '../Ticket'

type TicketProp = {
  from: string,
  to: string,
  price: number,
}

interface Props {
  ticket: TicketProp,
  onBuy: () => void,
}

const TicketItem: React.FC<Props> = ({ ticket, onBuy }) => (
  <div style={{ marginBottom: 20 }}>
    <Ticket price={ticket.price} from={ticket.from} to={ticket.to} />
    <button onClick={onBuy}>Buy</button>
  </div>
)

export default TicketItem
