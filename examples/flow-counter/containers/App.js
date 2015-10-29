/* @flow */

import { connect } from 'react-redux';
import Counter from '../components/Counter';
import { increment, decrement, incrementIfOdd, incrementAsync } from '../actions/counter';
import type { AppState, Dispatchable } from '../types';
import type { Dispatch } from 'redux';

type StateProps = AppState;

function mapStateToProps(state : AppState) : StateProps {
  return {
    counter: state.counter
  };
}

type DispatchProps = {
  increment: () => any,
  decrement: () => any,
  incrementIfOdd: () => any,
  incrementAsync: () => any
}

function mapDispatchToProps(dispatch: Dispatch<Dispatchable>) : DispatchProps {
  return {
    increment: () => dispatch(increment()),
    decrement: () => dispatch(decrement()),
    incrementIfOdd: () => dispatch(incrementIfOdd()),
    incrementAsync: () => dispatch(incrementAsync()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
