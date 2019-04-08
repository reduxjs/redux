import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './components/App';
import Quizz from './containers/QuizzContainer';
import FinishContainer from './containers/FinishContainer';
import ErrorBoundary from './components/ErrorBoundary';


const Root = () => (
  <ErrorBoundary>
    <Router>
      <div>
        <Route exact path="/" component={App} />
        <Route path="/quizz" component={Quizz} />
        <Route path="/finish" component={FinishContainer} />
      </div>
    </Router>
  </ErrorBoundary>
);

export default Root;
