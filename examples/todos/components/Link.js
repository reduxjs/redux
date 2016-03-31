import React, { PropTypes } from 'react';

const Link = ({ active, children, onClick }) => (
  <a href="#"
    onClick={e => {
      e.preventDefault();
      onClick();
    }}
  >
    { active ? <span>{children}</span> : null }
  </a>
);

Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Link;
