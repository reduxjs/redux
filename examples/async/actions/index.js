import { CALL_API, Schemas } from '../middleware/api';

const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export function fetchUser(login) {
  return {
    [CALL_API]: {
      types: [FETCH_USER_REQUEST, FETCH_USER_SUCCESS, FETCH_USER_FAILURE],
      endpoint: `users/${login}`,
      schema: Schemas.USER
    }
  };
}
