import union from 'lodash/union'
import { createReducer } from '@reduxjs/toolkit'

// Creates a reducer managing pagination, given the action types to handle,
// and a function telling how to extract the key from an action.
const paginate = ({ asyncThunk, mapActionToKey }) => {
  const requestType = asyncThunk.pending
  const successType = asyncThunk.fulfilled
  const failureType = asyncThunk.rejected

  const updatePagination = createReducer(
    {
      isFetching: false,
      nextPageUrl: undefined,
      pageCount: 0,
      ids: []
    },
    builder => {
      builder
        .addCase(requestType, state => {
          state.isFetching = true
        })
        .addCase(successType, (state, action) => {
          state.isFetching = false
          state.ids = union(state.ids, action.payload.result)
          state.nextPageUrl = action.payload.nextPageUrl
          state.pageCount = state.pageCount + 1
        })
        .addCase(failureType, state => {
          state.isFetching = false
        })
    }
  )

  return createReducer({}, builder => {
    builder.addMatcher(
      action => action.type.startsWith(asyncThunk.typePrefix),
      (state, action) => {
        const key = mapActionToKey(action)
        if (typeof key !== 'string') {
          throw new Error('Expected key to be a string.')
        }
        state[key] = updatePagination(state[key], action)
      }
    )
  })
}

export default paginate
