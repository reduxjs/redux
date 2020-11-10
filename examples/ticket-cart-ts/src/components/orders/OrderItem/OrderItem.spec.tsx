import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import OrderItem from './OrderItem'

const order = {
  id: 1,
  createdAt: 111,
  to: 'to',
  from: 'from',
  price: 10
}

const onDelete = jest.fn()

describe('OrderItem component', () => {
  test('should render props', () => {
    const { container } = render(
      <OrderItem order={order} onDelete={onDelete} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should call the onDelete callback handler', () => {
    const { getByTestId } = render(
      <OrderItem order={order} onDelete={onDelete} />
    )

    fireEvent.click(getByTestId('delete-button'))

    expect(onDelete).toBeCalledTimes(1)
  })
})
