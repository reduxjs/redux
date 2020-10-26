import { createAsyncThunk } from '@reduxjs/toolkit'
import { callApi, Schemas } from './api'

/**
 * Fetches a single user from Github API.
 */
export const loadUser = createAsyncThunk(
  'loadUser',
  async ({ login }, { rejectWithValue }) => {
    try {
      const response = await callApi(`users/${login}`, Schemas.USER)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  },
  {
    // If the user is already cached, this thunk will not dispatch anything.
    condition: ({ login, requiredFields }, { getState }) => {
      const user = getState().entities.users[login]
      const shouldProceed = !(
        user && requiredFields.every(key => user.hasOwnProperty(key))
      )
      return shouldProceed
    }
  }
)

/**
 * Fetches a single Repo from Github API.
 */
export const loadRepo = createAsyncThunk(
  'loadRepo',
  async ({ fullName }, { rejectWithValue }) => {
    try {
      const response = await callApi(`repos/${fullName}`, Schemas.REPO)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  },
  {
    // If the user is repo cached, this thunk will not dispatch anything.
    condition: ({ fullName, requiredFields }, { getState }) => {
      const repo = getState().entities.repos[fullName]
      const shouldProceed = !(
        repo && requiredFields.every(key => repo.hasOwnProperty(key))
      )
      return shouldProceed
    }
  }
)

// Fetches a page of starred repos by a particular user.
// Bails out if page is cached and user didn't specifically request next page.
export const loadStarred = createAsyncThunk(
  'loadStarred',
  async ({ login }, { rejectWithValue, getState }) => {
    const { nextPageUrl = `users/${login}/starred` } =
      getState().pagination.starredByUser[login] || {}
    try {
      const response = await callApi(nextPageUrl, Schemas.REPO_ARRAY)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  },
  {
    // If the user is repo cached, this thunk will not dispatch anything.
    condition: ({ login, nextPage }, { getState }) => {
      const { pageCount = 0 } = getState().pagination.starredByUser[login] || {}
      const shouldProceed = !(pageCount > 0 && !nextPage)
      return shouldProceed
    }
  }
)

/**
 * Fetches a page of stargazers for a particular repo.
 * Bails out if page is cached and user didn't specifically request next page.
 * Relies on Redux Thunk middleware.
 */
export const loadStargazers = createAsyncThunk(
  'loadStargazers',
  async ({ fullName }, { rejectWithValue, getState }) => {
    const { nextPageUrl = `repos/${fullName}/stargazers` } =
      getState().pagination.stargazersByRepo[fullName] || {}
    try {
      const response = await callApi(nextPageUrl, Schemas.USER_ARRAY)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  },
  {
    // If the user is repo cached, this thunk will not dispatch anything.
    condition: ({ nextPage, fullName }, { getState }) => {
      const { pageCount = 0 } =
        getState().pagination.stargazersByRepo[fullName] || {}
      const shouldProceed = !(pageCount > 0 && !nextPage)
      return shouldProceed
    }
  }
)
