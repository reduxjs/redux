import { createSlice } from '@reduxjs/toolkit'
import merge from 'lodash/merge'

// Updates an entity cache in response to any action with payload.entities.
const entitiesSlice = createSlice({
  name: 'entitiesSlice',
  initialState: { users: {}, repos: {} },
  extraReducers: builder =>
    builder.addMatcher(
      action => action.payload && action.payload.entities,
      (state, action) => {
        return merge({}, state, action.payload.entities)
      }
    )
})

export default entitiesSlice
