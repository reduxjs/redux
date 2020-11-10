import React from 'react'
import { render } from '@testing-library/react'
import Order from './Order'

describe('Order component', () => {
  test('should render props', () => {
    const props = {
      id: 1,
      createdAt: 111,
      to: 'to',
      from: 'from',
      price: 10
    }

    const { container } = render(<Order {...props}/>)

    expect(container).toMatchSnapshot()
  })
})
