/* @flow */

import { connect } from 'react-redux';
import Counter from '../components/Counter';
import type { CounterProps } from '../components/Counter';
import { increment, decrement, incrementIfOdd, incrementAsync } from '../actions/counter';
import { AppState, Dispatchable } from '../types';
import type { Dispatch } from 'redux';
import type { Component } from 'react';

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
    increment: (...args) => dispatch(increment(...args)),
    decrement: (...args) => dispatch(decrement(...args)),
    incrementIfOdd: (...args) => dispatch(incrementIfOdd(...args)),
    incrementAsync: (...args) => dispatch(incrementAsync(...args)),
  };
}
// TODO: Cannot make this to correctly type check that the resulting props match
// the Counter prop types
export default connect(mapStateToProps, mapDispatchToProps)(Counter);
