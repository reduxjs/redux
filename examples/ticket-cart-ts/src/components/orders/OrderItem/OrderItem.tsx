import React from 'react'
import Order from '../Order'

type OrderProp = {
  from: string
  to: string
  price: number
  id: number
  createdAt: number
}

interface Props {
  order: OrderProp
  onDelete: () => void
}

const OrderItem: React.FC<Props> = ({ order, onDelete }) => (
  <div style={{ marginBottom: 20 }} data-testid="order-item">
    <Order {...order} />
    <button data-testid="delete-button" onClick={onDelete}>
      Delete
    </button>
  </div>
)

export default OrderItem
