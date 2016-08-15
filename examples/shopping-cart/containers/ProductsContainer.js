import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { addToCart } from '../actions'
import { getVisibleProducts } from '../reducers/products'
import ProductItem from '../components/ProductItem'
import ProductsList from '../components/ProductsList'

let ProductsContainer = ({ products, addToCart }) => (
<ProductsList title="Products">
		{products.map(product =>
			<ProductItem
				key={product.id}
				product={product}
				onAddToCartClicked={() => addToCart(product.id)} />
		)}
	</ProductsList>
)

ProductsContainer.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    inventory: PropTypes.number.isRequired
  })).isRequired,
  addToCart: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    products: getVisibleProducts(state.products)
  }
}

ProductsContainer = connect(
  mapStateToProps,
  { addToCart }
)(ProductsContainer)

export default ProductsContainer
