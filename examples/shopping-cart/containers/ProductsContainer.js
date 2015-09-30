import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addToCart } from '../actions';
import { getVisibleProducts } from '../reducers/products';
import ProductItem from '../components/ProductItem';
import ProductsList from '../components/ProductsList';

class ProductsContainer extends Component {
    render() {
        const { products } = this.props;
        return (
            <ProductsList title="Flux Shop Demo (Redux)">
                {products.map(product =>
                    <ProductItem
                        key={product.id}
                        product={product}
                        onAddToCartClicked={() => this.props.addToCart(product.id)}
                    />
                )}
            </ProductsList>
        );
    }
}

function mapStateToProps(state) {
    return {
        products: getVisibleProducts(state.products)
    };
}

export default connect(
    mapStateToProps,
    { addToCart }
)(ProductsContainer)
