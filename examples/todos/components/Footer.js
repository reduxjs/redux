import React, { Component, PropTypes } from 'react'

export class Footer extends Component {
  render() {
    return(
      <p>
        Show:
        {" "}
        {this.props.children}
      </p>
    )
  }
}

Footer.propTypes = {
  children: PropTypes.node.isRequired,
}