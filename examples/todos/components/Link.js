import React, { PropTypes, Component } from 'react'
import autobind from 'autobind-decorator'

@autobind
export class Link extends Component {
  render() {
    if (this.props.shouldActive) {
      return <span>{children}</span>
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
  shouldActive: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onLinkClick: PropTypes.func.isRequired
}
