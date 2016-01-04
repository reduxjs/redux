import React, { PropTypes, Component } from 'react'

const Posts = ({props}) => {
    return (
      <ul>
        {props.posts.map((post, i) =>
          <li key={i}>{post.title}</li>
        )}
      </ul>
    )
}
Posts.propTypes = {
  posts: PropTypes.array.isRequired
}

export default Posts
