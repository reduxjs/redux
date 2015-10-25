import React, { Component, PropTypes } from 'react';

export default class Product extends Component {
  render() {
    return <div> {this.props.children} </div>;
  }
}

Product.PropTypes = {
  children: PropTypes.renderable
};
