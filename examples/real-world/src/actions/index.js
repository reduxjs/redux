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
    condition: ({ login, requiredFields }, { getState }) => {
      const user = getState().entities.users[login]
      // If the user is already cached, nothing will be requested or dispatched
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
    condition: ({ fullName, requiredFields }, { getState }) => {
      const repo = getState().entities.repos[fullName]
      // If the repo is cached, nothing will be requested or dispatched
      const shouldProceed = !(
        repo && requiredFields.every(key => repo.hasOwnProperty(key))
      )
      return shouldProceed
    }
  }
)

/**
 * Fetches a page of starred repos by a particular user.
 */
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
    condition: ({ login, nextPage }, { getState }) => {
      const { pageCount = 0 } = getState().pagination.starredByUser[login] || {}
      // Bails out if page is cached and user didn't specifically request next page.
      const shouldProceed = !(pageCount > 0 && !nextPage)
      return shouldProceed
    }
  }
)

/**
 * Fetches a page of stargazers for a particular repo.
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
    condition: ({ nextPage, fullName }, { getState }) => {
      const { pageCount = 0 } =
        getState().pagination.stargazersByRepo[fullName] || {}
      // Bails out if page is cached and user didn't specifically request next page.
      const shouldProceed = !(pageCount > 0 && !nextPage)
      return shouldProceed
    }
  }
)
