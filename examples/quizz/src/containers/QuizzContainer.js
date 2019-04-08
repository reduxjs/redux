import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import * as math from 'mathjs';
import actionCreators from '../actions/action';
import Quizz from '../components/Quizz';

const QuizzContainer = ({
  history,
  continueQuizz,
  finishQuizz,
  incrementScore,
}) => {
  const operand1 = math.ceil(math.random(1, 100));
  const operand2 = math.ceil(math.random(1, 100));
  const correctAnswer = operand1 + operand2;
  const randomValue = math.ceil(math.random(1, 100));

  const results = [correctAnswer, randomValue];
  const randomIndex = math.round(math.random(0, 1));

  const handleFirstButton = () => {
    if (results[randomIndex] === correctAnswer) {
      continueQuizz();
      incrementScore();
      history.push('/quizz');
    } else {
      finishQuizz();
      history.push('/finish');
    }
  };

  const handleSecondButton = () => {
    if (results[1 - randomIndex] === correctAnswer) {
      continueQuizz();
      incrementScore();
      history.push('/quizz');
    } else {
      finishQuizz();
      history.push('/finish');
    }
  };

  const handleFinishQuizz = () => {
    finishQuizz();
    history.push('/finish');
  }

  return (
    <Quizz
      operand1={operand1}
      operand2={operand2}
      handleFirstButton={handleFirstButton}
      handleFinishQuizz={handleFinishQuizz}
      handleSecondButton={handleSecondButton}
      firstValue={results[randomIndex]}
      secondValue={results[1 - randomIndex]}
    />
  );
};


QuizzContainer.propTypes = {
  history: PropTypes.shape().isRequired,
  continueQuizz: PropTypes.func.isRequired,
  finishQuizz: PropTypes.func.isRequired,
  incrementScore: PropTypes.func.isRequired,
};

export default connect(null, actionCreators)(withRouter(QuizzContainer));
