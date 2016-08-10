import React, { PropTypes } from 'react'

export default function Posts({ posts }) {
  return (
    <ul>
      {posts.map((post, i) =>
        <li key={i}>{post.title}</li>
      )}
    </ul>
  )
}

Posts.propTypes = {
  posts: PropTypes.array.isRequired
}
