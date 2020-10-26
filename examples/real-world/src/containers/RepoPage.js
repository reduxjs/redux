import React from 'react'
import Repo from '../components/Repo'
import User from '../components/User'
import List from '../components/List'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { loadRepo, loadStargazers } from '../actions'

const RepoPage = () => {
  const dispatch = useDispatch()

  let { login: _login, name: _name } = useParams()

  // We need to lower case the login/name due to the way GitHub's API behaves.
  // Have a look at ../middleware/api.js for more details.
  const login = _login.toLowerCase()
  const name = _name.toLowerCase()
  const fullName = `${login}/${name}`

  const stargazersByRepo = useSelector(
    state => state.pagination.stargazersByRepo
  )
  const users = useSelector(state => state.entities.users)
  const repo = useSelector(state => state.entities.repos[fullName])
  const owner = users[login]

  const stargazersPagination = stargazersByRepo[fullName] || { ids: [] }
  const stargazers = stargazersPagination.ids.map(id => users[id])

  React.useEffect(() => {
    dispatch(loadRepo(fullName, ['description']))
    dispatch(loadStargazers(fullName))
  }, [fullName, dispatch])

  if (!repo || !owner) {
    return (
      <h1>
        <i>Loading {name} details...</i>
      </h1>
    )
  }

  return (
    <div>
      <Repo repo={repo} owner={owner} />
      <hr />
      <List
        renderItem={user => <User user={user} key={user.login} />}
        items={stargazers}
        onLoadMoreClick={() => {
          loadStargazers(fullName, true)
        }}
        loadingLabel={`Loading stargazers of ${name}...`}
        {...stargazersPagination}
      />
    </div>
  )
}

export default RepoPage
