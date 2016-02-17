import React, { Component } from 'react'
import Link from 'react-router/lib/Link'

export default class Home extends Component {
  render() {
    return (
      <div>
        <p>Home page</p>
        <p><Link to="/reddit/frontend">Frontend</Link></p>
      </div>
    )
  }
}
