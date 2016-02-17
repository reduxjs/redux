import React, { Component } from 'react'

export default class Layout extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
