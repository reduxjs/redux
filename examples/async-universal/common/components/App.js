import React, { Component } from 'react'

export default class App extends Component {
  render() {
    return (
      <div>
        <div>
          <h3>Redux async universal example</h3>
          <p>Code on <a href="https://github.com/reactjs/redux">Github</a></p>
          <hr/>
        </div>
        {this.props.children}
      </div>
    )
  }
}
