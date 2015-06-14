/* @flow */

import mapValues from 'lodash/object/mapValues';

import type { Store, Action, State } from '../types';

export default function composeStores(stores: Store[]): Store {
  return function Composition(state: State = {}, action: Action) {
    return mapValues(stores, (store, key) =>
      store(state[key], action)
    );
  };
}
