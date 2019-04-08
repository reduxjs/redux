import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import actionCreators from '../actions/action';
import Start from '../components/Start';


const StartContainer = ({ history, startQuizz }) => {
  const handleQuizz = () => {
    startQuizz();
    history.push('/quizz');
  };
  return (
    <Start startHandle={handleQuizz} />
  );
};

StartContainer.propTypes = {
  startQuizz: PropTypes.func.isRequired,
  history: PropTypes.shape().isRequired,
};

export default connect(null, actionCreators)(withRouter(StartContainer));
