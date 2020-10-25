import React from 'react'
import { Link } from 'react-router-dom'

const Repo = ({ repo, owner }) => {
  const { login } = owner
  const { name, description } = repo

  return (
    <div className="Repo">
      <h3>
        <Link to={`/${login}/${name}`}>{name}</Link>
        {' by '}
        <Link to={`/${login}`}>{login}</Link>
      </h3>
      {description && <p>{description}</p>}
    </div>
  )
}

export default Repo
