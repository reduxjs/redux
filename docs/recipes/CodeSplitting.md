# Code Splitting
In large web applications, it is often desirable to split up the app code into multiple JS bundles that can be loaded on-demand. This strategy, called 'code splitting', helps to increase performance of your application by reducing the size of the initial JS payload that must be fetched.

To code split with Redux, we want to be able to dynamically add reducers to the store. The default usage of Redux mandates that a single root reducer should to be passed to the `configureStore` call, which makes dynamically adding new reducers more difficult. Below, we discuss some approaches to solving this problem and reference two libraries that provide this functionality.

## Basic Principle
To dynamically add Reducers to a Redux store, there are two approaches that can be taken

### Using `replaceReducer`
The Redux store exposes the `replaceReducer` function, which replaces the current active reducer function with a new reducer function. We can leverage this function to add a reducer as follows:

```javascript
import { createStore } from 'redux';

// Define the Reducers that will always be present in the appication
const staticReducers = {
    users: usersReducer,
    posts: postsReducer
};

// Configure the store
export default function configureStore(initialState) {
  const store = createStore(createReducer(), initialState);

  // Add a dictionary to keep track of the registered async reducers
  store.asyncReducers = {};

  // Create an inject reducer function
  // This function adds the async reducer, and creates a new combined reducer
  store.injectReducer = (key, asyncReducer) => {
      this.asyncReducers[key] = asyncReducer;
      this.replaceReducer(createReducer(this.asyncReducers));
  };

  // Return the modified store
  return store;
}

function createReducer(asyncReducers) {
    return combineReducers({
        ...staticReducers,
        ...asyncReducers
    });
}

```
Now, one just needs to call `store.injectReducer` to add a new reducer to the store.

### Using a 'Reducer Manager'
Another approach is to create a 'Reducer Manager' object, which keeps track of all the registered reducers and exposes a `reduce()` function. Consider the following example:

```javascript
export function createReducerManager(initialReducers) {
    // Create an object which maps keys to reducers
    const reducers = { ...initialReducers };

    // Create the initial combinedReducer
    let combinedReducer = combineReducers(reducers);

    // An array which is used to delete state keys when reducers are removed
    const keysToRemove = [];

    return {
        getReducerMap: () => reducers,

        // The root reducer function exposed by this object
        // This will be passed to the store
        reduce: (state, action) => {
            // If any reducers have been removed, clean up their state first
            if (keysToRemove.length > 0) {
                state = { ...state as any };
                for (let key of keysToRemove) {
                    delete state[key];
                }
                keysToRemove = [];
            }

            // Delegate to the combined reducer
            return combinedReducer(state, action);
        },

        // Adds a new reducer with the specified key
        add: (key, reducer) => {
            if (!key || reducers[key]) {
                return;
            }

            // Add the reducer to the reducer mapping
            reducers[key] = reducer;

            // Generate a new combined reducer
            combinedReducer = combineReducers(reducers);
        },

        // Removes a reducer with the specified key
        remove: (key: string) => {
            if (!key || !reducers[key]) {
                return;
            }

            // Remove it from the reducer mapping
            delete reducers[key];

            // Add the key to the list of keys to clean up
            keysToRemove.push(key);

            // Generate a new combined reducer
            combinedReducer = combineReducers(rm);
        }
    };
}

const staticReducers = {
    users: usersReducer,
    posts: postsReducer
};

export function configureStore(initialState) {
    const reducerManager = createReducerManager(staticReducers);

    // Create a store with the root reducer function being the one exposed by the manager.
    const store = createStore(reducerManager.reduce, initialState);

    // Optional: Put the reducer manager on the store so it is easily accessible
    store.reducerManager = reducerManager;
}
```

To add a new reducer, one can now call `store.reducerManager.add("asyncState", asyncReducer)`.

To remove a reducer, one can now call `store.reducerManager.remove("asyncState")`

## Libraries and Frameworks
There are a few good libraries out there that can help you add the above functionality automatically:
 * [`redux-dynamic-reducer`](https://github.com/ioof-holdings/redux-dynamic-reducer)
    * This library exposes the `addReducer` function on the Redux store to accomplish the behavior we described above. It also has React bindings which make it easier to add reducers within the React component lifecycle.
* [`redux-dynamic-modules`](https://github.com/Microsoft/redux-dynamic-modules)
    * This library introduces the concept of a 'Redux Module', which is a bundle of Redux artifacts (reducers, middleware) that should be dynamically loaded. It also exposes a React higher-order component to load 'modules' when areas of the application come online. Additionally, it has integrations with libraries like `redux-thunk` and `redux-saga` which also help dynamically load their artifacts (thunks, sagas). 
