import React, { Component } from 'react'
import { Link } from 'react-router'

export default class Layout extends Component {
  render() {
    return (
      <div>
        <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/sample">Sample</Link></li>
          <li><Link to="/counter">Counter</Link></li>
        </ul>
        </nav>
        {this.props.children}
      </div>
    )
  }
}
