/* @flow */

import type {Reducer, Store} from 'redux/flow/types';
import {createStore} from 'redux';

import type {State, Action} from './types';

import counter from './reducers/counter';

var store = createStore(counter, 0);
// var reducer = store.getReducer();
// counter(0, {type: 'a'}) // fails type check
// reducer(0, {type: 'a'}) // fails type check
// store.getState().replace('hey', 'ho'); // fails type check
store.dispatch({type: 'INCREMENT_COUNTER'});
// store.dispatch({type: 'foo'}); // fails type check
// store.dispatch({type: 'INCREMENT_COUNTE'}); // fails type check
store.dispatch({type: '@@redux/INIT'});
