# `composeReducers(initialState, ...reducers)`

Creates a new reducer composing passed in reducers from right to left.

You might want to use this utility to split a complex reducer in small chunks handling the same state.
Is always better to divide in more chunks reducers that are performing too much calculation
for a better testing and readability.

Sometimes you can simply flat your state dividing it into more parent keys and use `combineReducers`, which is fine and neat. But sometimes you might need to handle the same state across multiple reducers as they were a big one, which is where a solution like this helps you.

#### Arguments

1. `initialState` (*any*): the initial state to be used by default if no state is passed by redux to the created reducer.
2. `reducers` (*Array*): The reducers to compose. Each reducer is expected to accept the state and the dispatched action. Its return value will be the new state, if the action matches, to the reducer standing to the left, and so on.

#### Returns

(*Function*): The final reducer obtained by composing the given ones from right to left.

#### Example

This example demonstrates how to use `composeReducers` to split a complex reducer in small easy to test and read ones.


#### `reducers/loggedInUser/index.js`

```js
import { composeReducers } from 'redux'
import editInfo from './editInfo';
import uploadPhoto from './uploadPhoto';


const loggedInUser = composeReducers(
  {
    // shared loader for any save or download
    loading: false,

    username: '',
    email: '',
    photos: [],
  },
  editInfo,
  uploadPhoto
)

export default loggedInUser;
```

#### `reducers/loggedInUser/editInfo.js`

```js
export default function editInfo(state, action) {
  switch (action.type) {
    // might be an async operation
    case 'EDITING_LOGGED_IN_USER_INFO':
    return {
      ...state,
      loading: true
    }

    case 'SET_LOGGED_IN_USER_USERNAME':
    return {
      ...state,
      loading: false,
      username: action.payload
    }

    case 'SET_LOGGED_IN_USER_EMAIL':
    return {
      ...state,
      loading: false,
      email: action.payload
    }

    default:
    return state
  }
}
```

#### `reducers/loggedInUser/uploadPhoto.js`

```js
export default function editInfo(state, action) {
  switch (action.type) {
    case 'UPLOADING_LOGGED_IN_USER_PHOTO':
    case 'DOWNLOADING_LOGGED_IN_USER_PHOTOS':
    return {
      ...state,
      loading: true
    }

    case 'ADD_LOGGED_IN_USER_PHOTO':
    return {
      ...state,
      loading: false,
      photos: [...state.photos, action.payload]
    }

    case 'SET_LOGGED_IN_USER_PHOTOS':
    return {
      ...state,
      loading: false,
      photos: action.payload
    }

    default:
    return state
  }
}
```


#### Tips

* `initialState` lets you define the default state for your reducer, the internal reducers shouldn't care about any initial state in this case.
