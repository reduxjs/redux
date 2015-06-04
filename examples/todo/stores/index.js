import { ADD_TODO } from '../constants/ActionTypes';

const initialState = [{
  text: 'do something',
  id: 0
}];

export function todoStore(state = initialState, action) {
  switch (action.type) {
  case ADD_TODO:
    return [{
      id: state[0].id + 1,
      text: action.text
    }].concat(state);
  }

  return state;
}
