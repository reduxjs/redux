import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import Finish from '../components/Finish';
import actionCreators from '../actions/action';

const FinishContainer = ({ history, score, restartQuizz }) => {
  const restartHandle = () => {
    restartQuizz();
    history.push('/');
  };
  return (
    <Finish
      score={score}
      handleClick={restartHandle}
    />
  );
};

FinishContainer.propTypes = {
  history: PropTypes.shape().isRequired,
  restartQuizz: PropTypes.func.isRequired,
  score: PropTypes.number.isRequired,
};

const mapState = state => ({
  score: state.score,
});

export default connect(mapState, actionCreators)(FinishContainer);
