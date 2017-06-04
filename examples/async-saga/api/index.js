import fetch from 'isomorphic-fetch'

export function fetchPosts(reddit) {
  return fetch(`https://www.reddit.com/r/${reddit}.json`)
    .then(response => response.json())
}
