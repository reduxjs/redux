import React from 'react'

interface Props {
  price: number
  from: string
  to: string
}

const Product: React.FC<Props> = ({ price, from, to }) => (
  <div>
    {from} - {to} &#36;{price}
  </div>
)

export default Product
