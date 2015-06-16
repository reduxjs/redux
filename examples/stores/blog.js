import { FETCH_ALL_POSTS, FETCH_POST } from '../constants/ActionTypes';

const initialState = {
  posts: [],
  post: {}
};

export default function blog(state = initialState, action) {
  switch (action.type) {
    case FETCH_POST:
      return Object.assign({}, state, { post: action.post });
    case FETCH_ALL_POSTS:
      return Object.assign({}, state, { posts: action.posts });
  }

  return state;
}
