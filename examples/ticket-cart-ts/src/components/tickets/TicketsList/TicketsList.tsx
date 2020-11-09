import React from 'react'

const TicketsList: React.FC = ({ children }) => (
  <div>
    <h3>Tickets</h3>
    <div>{children}</div>
  </div>
)

export default TicketsList
