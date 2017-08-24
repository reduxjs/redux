import { combineReducers } from 'redux';
import { State } from '../types';
import todos from './todos';
import visibilityFilter from './visibilityFilter';

export default combineReducers<State>({
  todos,
  visibilityFilter
});
