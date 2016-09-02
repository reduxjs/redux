import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class Repo extends Component {

  render() {
    const { repo, owner } = this.props
    const { login } = owner
    const { name, description } = repo

    return (
      <div className="Repo">
        <h3>
          <Link to={`/${login}/${name}`}>
            {name}
          </Link>
          {' by '}
          <Link to={`/${login}`}>
            {login}
          </Link>
        </h3>
        {description &&
          <p>{description}</p>
        }
      </div>
    )
  }
}

Repo.propTypes = {
  repo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string
  }).isRequired,
  owner: PropTypes.shape({
    login: PropTypes.string.isRequired
  }).isRequired
}
