import {
  CONTINUE_QUIZZ,
  FINISH_QUIZZ,
  INCREMENT_SCORE,
  RESTART_QUIZZ,
  START_QUIZZ,
} from './constants';

const continueQuizz = () => ({
  type: CONTINUE_QUIZZ,
});

const finishQuizz = () => ({
  type: FINISH_QUIZZ,
});

const incrementScore = () => ({
  type: INCREMENT_SCORE,
});

const restartQuizz = () => ({
  type: RESTART_QUIZZ,
});
const startQuizz = () => ({
  type: START_QUIZZ,
});


const actionCreators = {
  continueQuizz,
  finishQuizz,
  incrementScore,
  restartQuizz,
  startQuizz,
};

export default actionCreators;
