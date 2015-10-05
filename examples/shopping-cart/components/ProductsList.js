import React, { Component, PropTypes } from 'react';

export default class ProductsList extends Component {
  render() {
    return (
      <div className="shop-wrap">
        <h2 className="uk-h2">{this.props.title}</h2>
        <div>{this.props.children}</div>
      </div>
    );
  }
};

ProductsList.propTypes = {
  title: PropTypes.string.isRequired
};