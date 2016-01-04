import React, { Component, PropTypes } from 'react'

const ProductsList = (props) =>{
    return (
      <div>
        <h3>{props.title}</h3>
        <div>{props.children}</div>
      </div>
    )
}

ProductsList.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired
}

export default ProductsList;