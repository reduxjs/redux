import 'isomorphic-fetch';
import { FETCH_ALL_POSTS, FETCH_POST } from '../constants/ActionTypes';

export function fetchAllPosts() {
  return dispatch => {
    fetch('http://jsonplaceholder.typicode.com/posts')
    .then(res => res.json())
    .then(res => dispatch({
      type: FETCH_ALL_POSTS,
      posts: res
    }));
  };
}

export function fetchPost(id) {
  return dispatch => {
    fetch(`http://jsonplaceholder.typicode.com/posts/${id}`)
    .then(res => res.json())
    .then(res => dispatch({
      type: FETCH_POST,
      post: res
    }));
  };
}
