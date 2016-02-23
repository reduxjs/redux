import { fetchPostsIfNeeded, selectReddit } from '../actions'

export function fetchData(store, subreddit, callback) {

  if (!subreddit) return callback()

  Promise.all([
    store.dispatch(selectReddit(subreddit)),
    store.dispatch(fetchPostsIfNeeded(subreddit))
  ]).then(() => {
    callback()
  })

}
