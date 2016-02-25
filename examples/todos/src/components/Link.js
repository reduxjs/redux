import React, { PropTypes, Component } from 'react'
import autobind from 'autobind-decorator'

@autobind
export default class Link extends Component {
  render() {
    if (this.props.active) {
      return <span>{this.props.children}</span>
    }

    return (
      <a href="#" onClick={this._onClick}>
        {this.props.children}
      </a>
    )
  }

  _onClick(e) {
    e.preventDefault()
    this.props.onLinkClick()
  }
}

Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onLinkClick: PropTypes.func.isRequired
}
