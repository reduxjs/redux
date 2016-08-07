import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class User extends Component {
  render() {
    const { login, avatarUrl, name } = this.props.user

    return (
      <div className="User">
        <Link to={`/${login}`}>
          <img src={avatarUrl} width="72" height="72" />
          <h3>
            {login} {name && <span>({name})</span>}
          </h3>
        </Link>
      </div>
    )
  }
}

User.propTypes = {
  user: PropTypes.shape({
    login: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequired,
    name: PropTypes.string
  }).isRequired
}
