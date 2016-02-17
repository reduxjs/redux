import React, { Component } from 'react'
import Link from 'react-router/lib/Link'

export default class Layout extends Component {
  render() {
    return (
      <div>
        <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/sample">Sample</Link></li>
          <li><Link to="/reddit">Reddit</Link></li>
        </ul>
        </nav>
        {this.props.children}
      </div>
    )
  }
}
