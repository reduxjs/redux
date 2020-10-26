import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadUser, loadStarred } from '../actions'
import User from '../components/User'
import Repo from '../components/Repo'
import List from '../components/List'
import { useParams } from 'react-router-dom'

const UserPage = () => {
  const dispatch = useDispatch()
  let { login: _login } = useParams()
  // We need to lower case the login/name due to the way GitHub's API behaves.
  // Have a look at ../middleware/api.js for more details.
  const login = _login.toLowerCase()

  const starredByUser = useSelector(state => state.pagination.starredByUser)
  const users = useSelector(state => state.entities.users)
  const repos = useSelector(state => state.entities.repos)
  const user = users[login]

  const starredPagination = useMemo(() => starredByUser[login] || { ids: [] }, [
    login,
    starredByUser
  ])

  const userItems = useMemo(
    () =>
      starredPagination.ids.map(id => {
        const repo = repos[id]
        const owner = users[repo.owner]
        return [repo, owner]
      }),
    [starredPagination, users, repos]
  )

  React.useEffect(() => {
    dispatch(loadUser(login, ['name']))
    dispatch(loadStarred(login))
  }, [login, dispatch])

  if (!user) {
    return (
      <h1>
        <i>
          Loading {login}
          {"'s profile..."}
        </i>
      </h1>
    )
  }

  return (
    <div>
      <User user={user} />
      <hr />
      <List
        renderItem={([repo, owner]) => (
          <Repo repo={repo} owner={owner} key={repo.fullName} />
        )}
        items={userItems}
        onLoadMoreClick={() => {
          dispatch(loadStarred(login, true))
        }}
        loadingLabel={`Loading ${login}'s starred...`}
        {...starredPagination}
      />
    </div>
  )
}

export default UserPage
