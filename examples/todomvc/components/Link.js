import React, { PropTypes } from 'react'
import classnames from 'classnames'

const Link = ({ active, children, onClick }) => (
  <li>
    <a href="#"
       className={classnames({ selected: active === true })}
       style={{ cursor: 'pointer' }}
       onClick={e => {
         e.preventDefault()
         onClick()
       }}
    >
      {children}
    </a>
  </li>
)

Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
}

export default Link
