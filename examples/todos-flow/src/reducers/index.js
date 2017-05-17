// @flow

import { combineReducers } from 'redux';

import todos from './todos';
import visibilityFilter from './visibility-filter';

export default combineReducers({
  todos,
  visibilityFilter
});
