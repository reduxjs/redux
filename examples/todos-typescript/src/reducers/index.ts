import { combineReducers } from 'redux';

import todos from './todos';
import visibilityFilter from './visibilityFilter';

// TODO: waiting for fix of Action typings.
// Bug: We cannot use plain aciton like { type: 'DO' } but need to extend Action object.
// Fix is already in index.d.ts@master just need to wait till new redux is released.
const combine: any = combineReducers;

export default combine({
  todos,
  visibilityFilter
});
