/**
 * Updates a single local entity with new data.
 */
function entity(state = {}, fetchedEntity) {
  return Object.assign({}, state, fetchedEntity);
}

/**
 * Updates a local table with fetched data.
 */
function table(state = {}, fetchedTable) {
  if (!fetchedTable) {
    return state;
  }

  let nextState = Object.assign({}, state);
  Object.keys(fetchedTable).forEach(key =>
    nextState[key] = entity(state[key], fetchedTable[key])
  );
  return nextState;
}

/**
 * Updates a local database in response to any action containing response.entities.
 */
export function database(state = {}, action) {
  if (!action.response || !action.response.entities) {
    return state;
  }

  const fetchedTables = action.response.entities;
  let nextState = {};
  Object.keys(fetchedTables).forEach(key =>
    nextState[key] = table(state[key], fetchedTables[key])
  );
  return nextState;
}
