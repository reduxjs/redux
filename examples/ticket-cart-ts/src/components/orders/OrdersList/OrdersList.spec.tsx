import React from 'react'
import { render } from '@testing-library/react'
import OrdersList from './OrdersList'

describe('OrdersList component', () => {
  test('should render props', () => {
    const { container } = render(
      <OrdersList>
        <p>Order children</p>
      </OrdersList>
    )

    expect(container).toMatchSnapshot()
  })
})
