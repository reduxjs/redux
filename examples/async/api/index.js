import { Schema, arrayOf, normalize } from 'normalizr';
import { camelizeKeys } from 'humps';
import 'isomorphic-fetch';

/**
 * Extracts the next page URL from Github API response.
 */
function getNextPageUrl(response) {
  const link = response.headers.get('link');
  if (!link) {
    return null;
  }

  const nextLink = link.split(',').filter(s => s.indexOf('rel="next"') > -1)[0];
  if (!nextLink) {
    return null;
  }

  return nextLink.split(';')[0].slice(1, -1);
}

// We use this Normalizr schemas to transform API responses from a nested form
// to a flat form where repos and users are placed in `entities`, and nested
// JSON objects are replaced with their IDs. This is very convenient for
// consumption by reducers, because we can easily build a normalized tree
// and keep it updated as we fetch more data.

// Read more about Normalizr: https://github.com/gaearon/normalizr

const userSchema = new Schema('users', { idAttribute: 'login' });
const repoSchema = new Schema('repos', { idAttribute: 'fullName' });
repoSchema.define({
  owner: userSchema
});

const API_ROOT = 'https://api.github.com/';

/**
 * Fetches an API response and normalizes the result JSON according to schema.
 */
function fetchAndNormalize(url, schema) {
  if (url.indexOf(API_ROOT) === -1) {
    url = API_ROOT + url;
  }

  return fetch(url).then(response =>
    response.json().then(json => {
      const camelizedJson = camelizeKeys(json);
      const nextPageUrl = getNextPageUrl(response) || undefined;

      return {
        ...normalize(camelizedJson, schema),
        nextPageUrl
      };
    })
  );
}

export function fetchUser(url) {
  return fetchAndNormalize(url, userSchema);
}

export function fetchUserArray(url) {
  return fetchAndNormalize(url, arrayOf(userSchema));
}

export function fetchRepo(url) {
  return fetchAndNormalize(url, repoSchema);
}

export function fetchRepoArray(url) {
  return fetchAndNormalize(url, arrayOf(repoSchema));
}