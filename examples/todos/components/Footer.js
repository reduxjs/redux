import React, { PropTypes } from 'react'

const Footer = ({ children }) => (
  <p>
    Show:
    {" "}
    {children}
  </p>
)

Footer.propTypes = {
  children: PropTypes.node.isRequired
}

export default Footer
