import { ADD_TODO } from '../constants/ActionTypes';

const initialState = [{
  text: 'do something',
  id: 0
}];

export default function todos(state = initialState, action) {
  switch (action.type) {
  case ADD_TODO:
    return [{
      id: state[0].id + 1,
      text: action.text
    }, ...state];
  }

  return state;
}
