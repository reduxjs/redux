import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import OrderItem from '../../components/orders/OrderItem'
import OrdersList from '../../components/orders/OrdersList'
import { getOrdersWithTicketData } from '../../store/selectors'
import type { RootState } from '../../store/reducers'
import type { OrderId } from '../../store/orders/types'
import { ordersActions } from '../../store/orders'

const OrdersContainer: React.FC = () => {
  const dispatch = useDispatch()
  const orders = useSelector((state: RootState) => getOrdersWithTicketData(state))

  const deleteOrder = (id: OrderId) => dispatch(ordersActions.deleteOrder(id))

  return (
    <OrdersList>
      {orders.map(order => (
        <OrderItem
          key={order.id}
          order={order}
          onDelete={() => deleteOrder(order.id)}
        />
      ))}
    </OrdersList>
  )
}

export default OrdersContainer
