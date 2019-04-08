import {
  FINISH_QUIZZ,
  INCREMENT_SCORE,
  RESTART_QUIZZ,
  START_QUIZZ,
} from '../actions/constants';

const initialState = {
  start: false,
  finish: false,
  score: 0,
};

const quizzReducer = (state = initialState, action) => {
  switch (action.type) {
    case FINISH_QUIZZ:
      return {
        ...state,
        finish: true,
      };
    case INCREMENT_SCORE:
      return {
        ...state,
        score: state.score + 10,
      };
    case RESTART_QUIZZ:
      return {
        ...state,
        start: true,
        finish: false,
        score: 0,
      };
    case START_QUIZZ:
      return {
        ...state,
        start: true,
      };
    default:
      return state;
  }
};


export default quizzReducer;
