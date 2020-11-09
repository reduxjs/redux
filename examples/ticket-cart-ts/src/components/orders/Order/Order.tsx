import React from 'react'

interface Props {
  id: number
  createdAt: number
  from: string
  to: string
  price: number
}

const Order: React.FC<Props> = ({ id, createdAt, from, to, price }) => (
  <div>
    Order: {id} - {createdAt}
    <br />
    {from} - {to} &#36;{price}
  </div>
)

export default Order
