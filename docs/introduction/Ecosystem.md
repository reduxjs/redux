# Ecosystem

Redux is a tiny library, but its contracts and APIs are carefully chosen to spawn an ecosystem of tools and extensions, and the community has created a wide variety of helpful addons, libraries, and tools. You don't need to use any of these addons to use Redux, but they can help make it easier to implement features and solve problems in your application.

For an extensive catalog of libraries, addons, and tools related to Redux, check out the [Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) list. Also, the [React/Redux Links](https://github.com/markerikson/react-redux-links) list contains tutorials and other useful resources for anyone learning React or Redux.

This page lists some of the Redux-related addons that the Redux maintainers have vetted personally, or that have shown widespread adoption in the community. Don't let this discourage you from trying the rest of them! The ecosystem is growing too fast, and we have a limited time to look at everything. Consider these the “staff picks”, and don't hesitate to submit a PR if you've built something wonderful with Redux.

## Table of Contents

- [Library Integration and Bindings](#library-integration-and-bindings)
- [Reducers](#reducers)
  - [Reducer Combination](#reducer-combination)
  - [Reducer Composition](#reducer-composition)
  - [Higher-Order Reducers](#higher-order-reducers)
- [Actions](#actions)
- [Utilities](#utilities)
- [Store](#store)
  - [Change Subscriptions](#change-subscriptions)
  - [Batching](#batching)
  - [Persistence](#persistence)
- [Immutable Data](#immutable-data)
  - [Data Structures](#data-structures)
  - [Immutable Update Utilities](#immutable-update-utilities)
  - [Immutable/Redux Interop](#immutable-redux-interop)
- [Side Effects](#side-effects)
  - [Widely Used](#widely-used)
  - [Promises](#promises)
- [Middleware](#middleware)
  - [Networks and Sockets](#networks-and-sockets)
  - [Async Behavior](#async-behavior)
  - [Analytics](#analytics)
- [Entities and Collections](#entities-and-collections)
- [Component State and Encapsulation](#component-state-and-encapsulation)
- [Dev Tools](#dev-tools)
  - [Debuggers and Viewers](#debuggers-and-viewers)
  - [Logging](#logging)
  - [Mutation Detection](#mutation-detection)
- [Testing](#testing)
- [Routing](#routing)
- [Forms](#forms)
- [Higher-Level Abstractions](#higher-level-abstractions)
- [Community Conventions](#community-conventions)

## Library Integration and Bindings

**[reduxjs/react-redux](https://github.com/reduxjs/react-redux)**  
The official React bindings for Redux, maintained by the Redux team

**[angular-redux/ng-redux](https://github.com/angular-redux/ng-redux)**  
Angular 1 bindings for Redux

**[angular-redux/store](https://github.com/angular-redux/store)**  
Angular 2+ bindings for Redux

**[ember-redux/ember-redux](https://github.com/ember-redux/ember-redux)**  
Ember bindings for Redux

**[glimmer-redux/glimmer-redux](glimmer-redux/glimmer-redux)**  
Redux bindings for Ember's Glimmer component engine

**[tur-nr/polymer-redux](https://github.com/tur-nr/polymer-redux)**  
Redux bindings for Polymer

**[lastmjs/redux-store-element](https://github.com/lastmjs/redux-store-element)**
Redux bindings for custom elements

## Reducers

#### Reducer Combination

**[ryo33/combineSectionReducers](https://github.com/ryo33/combine-section-reducers)**  
An expanded version of `combineReducers`, which allows passing `state` as a third argument to all slice reducers.

**[KodersLab/topologically-combine-reducers](https://github.com/KodersLab/topologically-combine-reducers)**  
A `combineReducers` variation that allows defining cross-slice dependencies for ordering and data passing

```js
var masterReducer = topologicallyCombineReducers(
  { auth, users, todos },
  // define the dependency tree
  { auth: ['users'], todos: ['auth'] }
)
```

#### Reducer Composition

**[acdlite/reduce-reducers](https://github.com/acdlite/reduce-reducers)**  
Provides sequential composition of reducers at the same level

```js
const combinedReducer = combineReducers({ users, posts, comments })
const rootReducer = reduceReducers(combinedReducer, otherTopLevelFeatureReducer)
```

**[mhelmer/redux-xforms](https://github.com/mhelmer/redux-xforms)**  
A collection of composable reducer transformers

```js
const createByFilter = (predicate, mapActionToKey) =>
  compose(
    withInitialState({}), // inject initial state as {}
    withFilter(predicate), // let through if action has filterName
    updateSlice(mapActionToKey), // update a single key in the state
    isolateSlice(mapActionToKey) // run the reducer on a single state slice
  )
```

**[adrienjt/redux-data-structures](https://github.com/adrienjt/redux-data-structures)**  
Reducer factory functions for common data structures: counters, maps, lists (queues, stacks), sets

```js
const myCounter = counter({
  incrementActionTypes: ['INCREMENT'],
  decrementActionTypes: ['DECREMENT']
})
```

#### Higher-Order Reducers

**[omnidan/redux-undo](https://github.com/omnidan/redux-undo)**  
Effortless undo/redo and action history for your reducers

**[omnidan/redux-ignore](https://github.com/omnidan/redux-ignore)**  
Ignore redux actions by array or filter function

**[omnidan/redux-recycle](https://github.com/omnidan/redux-recycle)**  
Reset the redux state on certain actions

**[ForbesLindesay/redux-optimist](https://github.com/ForbesLindesay/redux-optimist)**  
A reducer enhancer to enable type-agnostic optimistic updates

## Actions

**[reduxactions/redux-actions](https://github.com/reduxactions/redux-actions)**  
Flux Standard Action utilities for Redux

```js
const increment = createAction('INCREMENT')
const reducer = handleActions({ [increment]: (state, action) => state + 1 }, 0)
const store = createStore(reducer)
store.dispatch(increment())
```

**[BerkeleyTrue/redux-create-types](https://github.com/BerkeleyTrue/redux-create-types)**  
Creates standard and async action types based on namespaces

```js
export const types = createTypes(
  ['openModal', createAsyncTypes('fetch')],
  'app'
)
// { openModal : "app.openModal", fetch : { start : "app.fetch.start", complete: 'app.fetch.complete' } }
```

**[maxhallinan/kreighter](https://github.com/maxhallinan/kreighter)**  
Generates action creators based on types and expected fields

```js
const formatTitle = (id, title) => ({
  id,
  title: toTitleCase(title)
})
const updateBazTitle = fromType('UPDATE_BAZ_TITLE', formatTitle)
updateBazTitle(1, 'foo bar baz')
// -> { type: 'UPDATE_BAZ_TITLE', id: 1, title: 'Foo Bar Baz', }
```

## Utilities

**[reduxjs/reselect](https://github.com/reduxjs/reselect)**  
Creates composable memoized selector functions for efficiently deriving data from the store state

```js
const taxSelector = createSelector(
  [subtotalSelector, taxPercentSelector],
  (subtotal, taxPercent) => subtotal * (taxPercent / 100)
)
```

**[paularmstrong/normalizr](https://github.com/paularmstrong/normalizr)**  
Normalizes nested JSON according to a schema

```js
const user = new schema.Entity('users')
const comment = new schema.Entity('comments', { commenter: user })
const article = new schema.Entity('articles', {
  author: user,
  comments: [comment]
})
const normalizedData = normalize(originalData, article)
```

**[planttheidea/selectorator](https://github.com/planttheidea/selectorator)**  
Abstractions over Reselect for common selector use cases

```js
const getBarBaz = createSelector(
  ['foo.bar', 'baz'],
  (bar, baz) => `${bar} ${baz}`
)
getBarBaz({ foo: { bar: 'a' }, baz: 'b' }) // "a b"
```

## Store

#### Change Subscriptions

**[jprichardson/redux-watch](https://github.com/jprichardson/redux-watch)**  
Watch for state changes based on key paths or selectors

```js
let w = watch(() => mySelector(store.getState()))
store.subscribe(
  w((newVal, oldVal) => {
    console.log(newval, oldVal)
  })
)
```

**[ashaffer/redux-subscribe](https://github.com/ashaffer/redux-subscribe)**  
Centralized subscriptions to state changes based on paths

```js
store.dispatch( subscribe("users.byId.abcd", "subscription1", () => {} );
```

#### Batching

**[tappleby/redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe)**  
Store enhancer that can debounce subscription notifications

```js
const debounceNotify = _.debounce(notify => notify())
const store = createStore(
  reducer,
  initialState,
  batchedSubscribe(debounceNotify)
)
```

**[manaflair/redux-batch](https://github.com/manaflair/redux-batch)**  
Store enhancer that allows dispatching arrays of actions

```js
const store = createStore(reducer, reduxBatch)
store.dispatch([{ type: 'INCREMENT' }, { type: 'INCREMENT' }])
```

**[laysent/redux-batch-actions-enhancer](https://github.com/laysent/redux-batch-actions-enhancer)**  
Store enhancer that accepts batched actions

```js
const store = createStore(reducer, initialState, batch().enhancer)
store.dispatch(createAction({ type: 'INCREMENT' }, { type: 'INCREMENT' }))
```

**[tshelburne/redux-batched-actions](https://github.com/tshelburne/redux-batched-actions)**  
Higher-order reducer that handles batched actions

```js
const store = createStore(enableBatching(reducer), initialState)
store.dispatch(batchActions([{ type: 'INCREMENT' }, { type: 'INCREMENT' }]))
```

#### Persistence

**[rt2zz/redux-persist](https://github.com/rt2zz/redux-persist)**  
Persist and rehydrate a Redux store, with many extensible options

```js
const store = createStore(reducer, autoRehydrate())
persistStore(store)
```

**[react-stack/redux-storage](https://github.com/react-stack/redux-storage)**  
Persistence layer for Redux with flexible backends

```js
const reducer = storage.reducer(combineReducers(reducers))
const engine = createEngineLocalStorage('my-save-key')
const storageMiddleware = storage.createMiddleware(engine)
const store = createStore(reducer, applyMiddleware(storageMiddleware))
```

**[redux-offline/redux-offline](https://github.com/redux-offline/redux-offline)**  
Persistent store for Offline-First apps, with support for optimistic UIs

```js
const store = createStore(reducer, offline(offlineConfig))
store.dispatch({
  type: 'FOLLOW_USER_REQUEST',
  meta: { offline: { effect: {}, commit: {}, rollback: {} } }
})
```

## Immutable Data

#### Data Structures

**[facebook/immutable-js](https://github.com/facebook/immutable-js)**  
Immutable persistent data collections for Javascript

```js
const map1 = Map({ a: 1, b: 2, c: 3 })
const map2 = map1.set('b', 50)
map1.get('b') // 2
map2.get('b') // 50
```

**[rtfeldman/seamless-immutable](https://github.com/rtfeldman/seamless-immutable)**  
Frozen immutable arrays/objects, backwards-compatible with JS

```js
const array = Immutable(['totally', 'immutable', { a: 42 }])
array[0] = 'edited' // does nothing
```

**[planttheidea/crio](https://github.com/planttheidea/crio)**  
Immutable JS objects with a natural API

```js
const foo = crio(['foo'])
const fooBar = foo.push('bar') // new array: ['foo', 'bar']
```

**[aearly/icepick](https://github.com/aearly/icepick)**  
Utilities for treating frozen JS objects as persistent immutable collections.

```js
const newObj = icepick.assocIn({ c: { d: 'bar' } }, ['c', 'd'], 'baz')
const obj3 = icepicke.merge(obj1, obj2)
```

#### Immutable Update Utilities

**[mweststrate/immer](https://github.com/mweststrate/immer)**  
Immutable updates with normal mutative code, using Proxies

```js
const nextState = produce(baseState, draftState => {
  draftState.push({ todo: 'Tweet about it' })
  draftState[1].done = true
})
```

**[kolodny/immutability-helper](https://github.com/kolodny/immutability-helper)**  
A drop-in replacement for react-addons-update

```js
const newData = update(myData, {
  x: { y: { z: { $set: 7 } } },
  a: { b: { $push: [9] } }
})
```

**[mariocasciaro/object-path-immutable](https://github.com/mariocasciaro/object-path-immutable)**  
Simpler alternative to immutability-helpers and Immutable.js

```js
const newObj = immutable(obj)
  .set('a.b', 'f')
  .del(['a', 'c', 0])
  .value()
```

**[debitoor/dot-prop-immutable](https://github.com/debitoor/dot-prop-immutable)**  
Immutable version of the dot-prop lib, with some extensions

```js
const newState = dotProp.set(state, `todos.${index}.complete`, true)
const endOfArray = dotProp.get(obj, 'foo.$end')
```

#### Immutable/Redux Interop

**[gajus/redux-immutable](https://github.com/gajus/redux-immutable)**  
combineReducers equivalent that works with Immutable.js Maps

```js
const initialState = Immutable.Map()
const rootReducer = combineReducers({})
const store = createStore(rootReducer, initialState)
```

**[eadmundo/redux-seamless-immutable](https://github.com/eadmundo/redux-seamless-immutable)**  
combineReducers equivalent that works with seamless-immutable values

```js
import { combineReducers } from 'redux-seamless-immutable';
const rootReducer = combineReducers({ userReducer, posts
```

## Side Effects

#### Widely Used

**[gaearon/redux-thunk](https://github.com/gaearon/redux-thunk)**  
Dispatch functions, which are called and given `dispatch` and `getState` as parameters. This acts as a loophole for AJAX calls and other async behavior.

**Best for**: getting started, simple async and complex synchronous logic.

```js
function fetchData(someValue) {
    return (dispatch, getState) => {
        dispatch({type : "REQUEST_STARTED"});

        myAjaxLib.post("/someEndpoint", {data : someValue})
            .then(response => dispatch({type : "REQUEST_SUCCEEDED", payload : response})
            .catch(error => dispatch({type : "REQUEST_FAILED", error : error});
    };
}

function addTodosIfAllowed(todoText) {
    return (dispatch, getState) => {
        const state = getState();

        if(state.todos.length < MAX_TODOS) {
            dispatch({type : "ADD_TODO", text : todoText});
        }
    }
}
```

**[redux-saga/redux-saga](https://github.com/redux-saga/redux-saga)**  
Handle async logic using synchronous-looking generator functions. Sagas return descriptions of effects, which are executed by the saga middleware, and act like "background threads" for JS applications.

**Best for**: complex async logic, decoupled workflows

```js
function* fetchData(action) {
  const { someValue } = action
  try {
    const response = yield call(myAjaxLib.post, '/someEndpoint', {
      data: someValue
    })
    yield put({ type: 'REQUEST_SUCCEEDED', payload: response })
  } catch (error) {
    yield put({ type: 'REQUEST_FAILED', error: error })
  }
}

function* addTodosIfAllowed(action) {
  const { todoText } = action
  const todos = yield select(state => state.todos)

  if (todos.length < MAX_TODOS) {
    yield put({ type: 'ADD_TODO', text: todoText })
  }
}
```

**[redux-observable/redux-observable](https://github.com/redux-observable/redux-observable)**

Handle async logic using RxJS observable chains called "epics".
Compose and cancel async actions to create side effects and more.

**Best for**: complex async logic, decoupled workflows

```js
const loginRequestEpic = action$ =>
  action$
    .ofType(LOGIN_REQUEST)
    .mergeMap(({ payload: { username, password } }) =>
      Observable.from(postLogin(username, password))
        .map(loginSuccess)
        .catch(loginFailure)
    )

const loginSuccessfulEpic = action$ =>
  action$
    .ofType(LOGIN_SUCCESS)
    .delay(2000)
    .mergeMap(({ payload: { msg } }) => showMessage(msg))

const rootEpic = combineEpics(loginRequestEpic, loginSuccessfulEpic)
```

**[redux-loop/redux-loop](https://github.com/redux-loop/redux-loop)**

A port of the Elm Architecture to Redux that allows you to sequence your effects naturally and purely by returning them from your reducers. Reducers now return both a state value and a side effect description.

**Best for**: trying to be as much like Elm as possible in Redux+JS

```js
export const reducer = (state = {}, action) => {
  switch (action.type) {
    case ActionType.LOGIN_REQUEST:
      const { username, password } = action.payload
      return loop(
        { pending: true },
        Effect.promise(loginPromise, username, password)
      )
    case ActionType.LOGIN_SUCCESS:
      const { user, msg } = action.payload
      return loop(
        { pending: false, user },
        Effect.promise(delayMessagePromise, msg, 2000)
      )
    case ActionType.LOGIN_FAILURE:
      return { pending: false, err: action.payload }
    default:
      return state
  }
}
```

**[jeffbski/redux-logic](https://github.com/jeffbski/redux-logic)**

Side effects lib built with observables, but allows use of callbacks, promises, async/await, or observables. Provides declarative processing of actions.

**Best for**: very decoupled async logic

```js
const loginLogic = createLogic({
  type: Actions.LOGIN_REQUEST,

  process({ getState, action }, dispatch, done) {
    const { username, password } = action.payload

    postLogin(username, password)
      .then(
        ({ user, msg }) => {
          dispatch(loginSucceeded(user))

          setTimeout(() => dispatch(showMessage(msg)), 2000)
        },
        err => dispatch(loginFailure(err))
      )
      .then(done)
  }
})
```

#### Promises

**[acdlite/redux-promise](https://github.com/acdlite/redux-promise)**  
Dispatch promises as action payloads, and have FSA-compliant actions dispatched as the promise resolves or rejects.

```js
dispatch({ type: 'FETCH_DATA', payload: myAjaxLib.get('/data') })
// will dispatch either {type : "FETCH_DATA", payload : response} if resolved,
// or dispatch {type : "FETCH_DATA", payload : error, error : true} if rejected
```

**[lelandrichardson/redux-pack](https://github.com/lelandrichardson/redux-pack)**  
Sensible, declarative, convention-based promise handling that guides users in a good direction without exposing the full power of dispatch.

```js
dispatch({type : "FETCH_DATA", payload : myAjaxLib.get("/data") });

// in a reducer:
        case "FETCH_DATA": =
            return handle(state, action, {
                start: prevState => ({
                  ...prevState,
                  isLoading: true,
                  fooError: null
                }),
                finish: prevState => ({ ...prevState, isLoading: false }),
                failure: prevState => ({ ...prevState, fooError: payload }),
                success: prevState => ({ ...prevState, foo: payload }),
            });
```

## Middleware

#### Networks and Sockets

**[svrcekmichal/redux-axios-middleware](https://github.com/svrcekmichal/redux-axios-middleware)**  
Fetches data with Axios and dispatches start/success/fail actions

```js
export const loadCategories() => ({ type: 'LOAD', payload: { request : { url: '/categories'} } });
```

**[agraboso/redux-api-middleware](https://github.com/agraboso/redux-api-middleware)**  
Reads API call actions, fetches, and dispatches FSAs

```js
const fetchUsers = () => ({
  [CALL_API]: {
    endpoint: 'http://www.example.com/api/users',
    method: 'GET',
    types: ['REQUEST', 'SUCCESS', 'FAILURE']
  }
})
```

**[itaylor/redux-socket.io](https://github.com/itaylor/redux-socket.io)**  
An opinionated connector between socket.io and redux.

```js
const store = createStore(reducer, applyMiddleware(socketIoMiddleware))
store.dispatch({ type: 'server/hello', data: 'Hello!' })
```

**[tiberiuc/redux-react-firebase](https://github.com/tiberiuc/redux-react-firebase)**  
Integration between Firebase, React, and Redux

#### Async Behavior

**[rt2zz/redux-action-buffer](https://github.com/rt2zz/redux-action-buffer)**  
Buffers all actions into a queue until a breaker condition is met, at which point the queue is released

**[wyze/redux-debounce](https://github.com/wyze/redux-debounce)**  
FSA-compliant middleware for Redux to debounce actions.

**[mathieudutour/redux-queue-offline](https://github.com/mathieudutour/redux-queue-offline)**  
Queue actions when offline and dispatch them when getting back online.

#### Analytics

**[rangle/redux-beacon](https://github.com/rangle/redux-beacon)**  
Integrates with any analytics services, can track while offline, and decouples analytics logic from app logic

**[hyperlab/redux-insights](https://github.com/hyperlab/redux-insights)**  
Analytics and tracking with an easy API for writing your own adapters

**[markdalgleish/redux-analytics](https://github.com/markdalgleish/redux-analytics)**  
Watches for Flux Standard Actions with meta analytics values and processes them

## Entities and Collections

**[tommikaikkonen/redux-orm](https://github.com/tommikaikkonen/redux-orm)**  
A simple immutable ORM to manage relational data in your Redux store.

**[Versent/redux-crud](https://github.com/Versent/redux-crud)**  
Convention-based actions and reducers for CRUD logic

**[kwelch/entities-reducer](https://github.com/kwelch/entities-reducer)**  
A higher-order reducer that handles data from Normalizr

**[amplitude/redux-query](https://github.com/amplitude/redux-query)**  
Declare colocated data dependencies with your components, run queries when components mount, perform optimistic updates, and trigger server changes with Redux actions.

**[cantierecreativo/redux-bees](https://github.com/cantierecreativo/redux-bees)**  
Declarative JSON-API interaction that normalizes data, with a React HOC that can run queries

**[GetAmbassador/redux-clerk](https://github.com/GetAmbassador/redux-clerk)**  
Async CRUD handling with normalization, optimistic updates, sync/async action creators, selectors, and an extendable reducer.

**[shoutem/redux-io](https://github.com/shoutem/redux-io)**  
JSON-API abstraction with async CRUD, normalization, optimistic updates, caching, data status, and error handling.

**[jmeas/redux-resource](https://github.com/jmeas/redux-resource)**  
A tiny but powerful system for managing 'resources': data that is persisted to remote servers.

## Component State and Encapsulation

**[tonyhb/redux-ui](https://github.com/tonyhb/redux-ui)**  
"Block-level scoping" for UI state. Decorated components declare data fields, which become props and can be updated by nested children.

```js
@ui({
  key: 'some-name',
  state: { uiVar1: '', uiVar2: (props, state) => state.someValue },
  reducer: (state, action) => {}
})
class YourComponent extends React.Component {}
```

**[threepointone/redux-react-local](https://github.com/threepointone/redux-react-local)**  
Local component state in Redux, with handling for component actions

```js
@local({
  ident: 'counter', initial: 0, reducer : (state, action) => action.me ? state + 1 : state }
})
class Counter extends React.Component {
```

**[epeli/lean-redux](https://github.com/epeli/lean-redux)**  
Makes component state in Redux as easy as setState

```js
const DynamicCounters = connectLean(
    scope: "dynamicCounters",
    getInitialState() => ({counterCount : 1}),
    addCounter, removeCounter
)(CounterList);
```

**[ioof-holdings/redux-subspace](https://github.com/ioof-holdings/redux-subspace)**  
Creates isolated "sub-stores" for decoupled micro front-ends, with integration for React, sagas, and observables

```js
const reducer = combineReducers({
  subApp1: namespaced('subApp1')(counter),
  subApp2: namespaced('subApp2')(counter)
})

const subApp1Store = subspace(state => state.subApp1, 'subApp1')(store)
const subApp2Store = subspace(state => state.subApp2, 'subApp2')(store)

subApp1Store.dispatch({ type: 'INCREMENT' })
console.log('store state:', store.getState()) // { "subApp1": { value: 2 }, "subApp2": { value: 1 } }
```

**[DataDog/redux-doghouse](https://github.com/DataDog/redux-doghouse)**  
Aims to make reusable components easier to build with Redux by scoping actions and reducers to a particular instance of a component.

```js
const scopeableActions = new ScopedActionFactory(actionCreators)
const actionCreatorsScopedToA = scopeableActions.scope('a')
actionCreatorsScopedToA.foo('bar') //{ type: SET_FOO, value: 'bar', scopeID: 'a' }

const boundScopeableActions = bindScopedActionFactories(
  scopeableActions,
  store.dispatch
)
const scopedReducers = scopeReducers(reducers)
```

## Dev Tools

#### Debuggers and Viewers

**[reduxjs/redux-devtools](https://github.com/reduxjs/redux-devtools)**

Dan Abramov's original Redux DevTools implementation, built for in-app display of state and time-travel debugging

**[zalmoxisus/redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)**

Mihail Diordiev's browser extension, which bundles multiple state monitor views and adds integration with the browser's own dev tools

**[infinitered/reactotron](https://github.com/infinitered/reactotron)**

A cross-platform Electron app for inspecting React and React Native apps, including app state, API requests, perf, errors, sagas, and action dispatching.

#### DevTools Monitors

**[Log Monitor](https://github.com/reduxjs/redux-devtools-log-monitor)**  
The default monitor for Redux DevTools with a tree view

**[Dock Monitor](https://github.com/reduxjs/redux-devtools-dock-monitor)**  
A resizable and movable dock for Redux DevTools monitors

**[Slider Monitor](https://github.com/calesce/redux-slider-monitor)**  
A custom monitor for Redux DevTools to replay recorded Redux actions

**[Inspector](https://github.com/alexkuz/redux-devtools-inspector)**  
A custom monitor for Redux DevTools that lets you filter actions, inspect diffs, and pin deep paths in the state to observe their changes

**[Diff Monitor](https://github.com/whetstone/redux-devtools-diff-monitor)**  
A monitor for Redux DevTools that diffs the Redux store mutations between actions

**[Filterable Log Monitor](https://github.com/bvaughn/redux-devtools-filterable-log-monitor/)**  
Filterable tree view monitor for Redux DevTools

**[Chart Monitor](https://github.com/romseguy/redux-devtools-chart-monitor)**  
A chart monitor for Redux DevTools

**[Filter Actions](https://github.com/zalmoxisus/redux-devtools-filter-actions)**  
Redux DevTools composable monitor with the ability to filter actions

#### Logging

**[evgenyrodionov/redux-logger](https://github.com/evgenyrodionov/redux-logger)**  
Logging middleware that shows actions, states, and diffs

**[inakianduaga/redux-state-history](https://github.com/inakianduaga/redux-state-history)**  
Enhancer that provides time-travel and efficient action recording capabilities, including import/export of action logs and action playback.

**[joshwcomeau/redux-vcr](https://github.com/joshwcomeau/redux-vcr)**  
Record and replay user sessions in real-time

**[socialtables/redux-unhandled-action](https://github.com/socialtables/redux-unhandled-action)**  
Warns about actions that produced no state changes in development

#### Mutation Detection

**[leoasis/redux-immutable-state-invariant](https://github.com/leoasis/redux-immutable-state-invariant)**  
Middleware that throws an error when you try to mutate your state either inside a dispatch or between dispatches.

**[flexport/mutation-sentinel](https://github.com/flexport/mutation-sentinel)**  
Helps you deeply detect mutations at runtime and enforce immutability in your codebase.

**[mmahalwy/redux-pure-connect](https://github.com/mmahalwy/redux-pure-connect)**  
Check and log whether react-redux's connect method is passed `mapState` functions that create impure props.

## Testing

**[arnaudbenard/redux-mock-store](https://github.com/arnaudbenard/redux-mock-store)**  
A mock store that saves dispatched actions in an array for assertions

**[Workable/redux-test-belt](https://github.com/Workable/redux-test-belt)**  
Extends the store API to make it easier assert, isolate, and manipulate the store

**[conorhastings/redux-test-recorder](https://github.com/conorhastings/redux-test-recorder)**  
Middleware to automatically generate reducers tests based on actions in the app

**[wix/redux-testkit](https://github.com/wix/redux-testkit)**  
Complete and opinionated testkit for testing Redux projects (reducers, selectors, actions, thunks)

**[jfairbank/redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan)**  
Makes integration and unit testing of sagas a breeze

## Routing

**[ReactTraining/react-router-redux](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-redux)**  
Keep your state in sync with your router

**[FormidableLabs/redux-little-router](https://github.com/FormidableLabs/redux-little-router)**  
A tiny router for Redux applications that lets the URL do the talking

**[faceyspacey/redux-first-router](https://github.com/faceyspacey/redux-first-router)**  
Seamless Redux-first routing. Think of your app in states, not routes, not components, while keeping the address bar in sync. Everything is state. Connect your components and just dispatch flux standard actions.

## Forms

**[erikras/redux-form](https://github.com/erikras/redux-form)**  
A full-featured library to enable a React HTML form to store its state in Redux.

**[davidkpiano/react-redux-form](https://github.com/davidkpiano/react-redux-form)**  
React Redux Form is a collection of reducer creators and action creators that make implementing even the most complex and custom forms with React and Redux simple and performant.

## Higher-Level Abstractions

**[keajs/kea](https://github.com/keajs/kea)**  
An abstraction over Redux, Redux-Saga and Reselect. Provides a framework for your app’s actions, reducers, selectors and sagas. It empowers Redux, making it as simple to use as setState. It reduces boilerplate and redundancy, while retaining composability.

**[jumpsuit/jumpstate](https://github.com/jumpsuit/jumpstate)**  
A simplified layer over Redux. No action creators or explicit dispatching, with a built-in simple side effects system.

**[TheComfyChair/redux-scc](https://github.com/TheComfyChair/redux-scc)**  
Takes a defined structure and uses 'behaviors' to create a set of actions, reducer responses and selectors.

**[Bloomca/redux-tiles](https://github.com/Bloomca/redux-tiles)**  
Provides minimal abstraction on top of Redux, to allow easy composability, easy async requests, and sane testability.

## Community Conventions

**[Flux Standard Action](https://github.com/acdlite/flux-standard-action)**  
A human-friendly standard for Flux action objects

**[Canonical Reducer Composition](https://github.com/gajus/canonical-reducer-composition)**  
An opinionated standard for nested reducer composition

**[Ducks: Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux)**  
A proposal for bundling reducers, action types and actions
