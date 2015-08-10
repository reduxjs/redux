import { fetchUser } from '../api';

export function getUser(login) {
  return dispatch => {
    fetchUser(`users/${login}`).then(response =>
      dispatch({ type: 'TEST', response })
    );
  }
}