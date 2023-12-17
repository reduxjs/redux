---
id: migrating-rtk-2
title: Migrating to RTK 2.0 and Redux 5.0
sidebar_label: Migrating to RTK 2.0 and Redux 5.0
hide_title: true
toc_max_heading_level: 4
---

&nbsp;

<div className="migration-guide">

# Migrating to RTK 2.0 and Redux 5.0

:::tip What You'll Learn

- What's changed in Redux Toolkit 2.0, Redux core 5.0, Reselect 5.0, and Redux Thunk 3.0, including breaking changes and new features

:::

## Introduction

Redux Toolkit has been available since 2019, and today it's the standard way to write Redux apps. We've gone 4+ years without any breaking changes. Now, RTK 2.0 gives us a chance to modernize the packaging, clean up deprecated options, and tighten up some edge cases.

**Redux Toolkit 2.0 is accompanied by major versions of all the other Redux packages: Redux core 5.0, React-Redux 9.0, Reselect 5.0, and Redux Thunk 3.0**.

This page lists known potentially breaking changes in each of those packages, as well as new features in Redux Toolkit 2.0. As a reminder, **you should not need to actually install or use the core `redux` package directly** - RTK wraps that, and re-exports all methods and types.

In practice, **most of the "breaking" changes should not have an actual effect on end users, and we expect that many projects can just update the package versions with very few code changes needed**.

The changes most likely to need app code updates are:

- [Object syntax removed for `createReducer` and `createSlice.extraReducers`](#object-syntax-for-createsliceextrareducers-and-createreducer-removed)
- [`configureStore.middleware` must be a callback](#configurestoremiddleware-must-be-a-callback)
- [`Middleware` type changed - Middleware `action` and `next` are typed as `unknown`](#middleware-type-changed---middleware-action-and-next-are-typed-as-unknown)

## Packaging Changes (all)

We've made updates to the build packaging for all of the Redux-related libraries. These are technically "breaking", but _should_ be transparent to end users, and actually enable better support for scenarios such as using Redux via ESM files under Node.

#### Addition of `exports` field in `package.json`

We've migrated the package definitions to include the `exports` field for defining which artifacts to load, with a modern ESM build as the primary artifact (with CJS still included for compatibility purposes).

We've done local testing of the package, but we ask the community to try out this in your own projects and report any breakages you find!

#### Build Artifact Modernization

We've updated the build output in several ways:

- **Build output is no longer transpiled!** Instead we target modern JS syntax (ES2020)
- Moved all build artifacts to live under `./dist/`, instead of separate top-level folders
- The lowest Typescript version we test against is now **TS 4.7**.

#### Dropping UMD builds

Redux has always shipped with UMD build artifacts. These are primarily meant for direct import as script tags, such as in a CodePen or a no-bundler build environment.

For now, we're dropping those build artifacts from the published package, on the grounds that the use cases seem pretty rare today.

We do have a browser-ready ESM build artifact included at `dist/$PACKAGE_NAME.browser.mjs`, which can be loaded via a script tag that points to that file on Unpkg.

If you have strong use cases for us continuing to include UMD build artifacts, please let us know!

## Breaking Changes

### Core

#### Action types _must_ be strings

We've always specifically told our users that [actions and state _must_ be serializable](https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions), and that `action.type` _should_ be a string. This is both to ensure that actions are serializable, and to help provide a readable action history in the Redux DevTools.

`store.dispatch(action)` now specifically enforces that **`action.type` _must_ be a string** and will throw an error if not, in the same way it throws an error if the action is not a plain object.

In practice, this was already true 99.99% of the time and shouldn't have any effect on users (especially those using Redux Toolkit and `createSlice`), but there may be some legacy Redux codebases that opted to use Symbols as action types.

#### `createStore` Deprecation

In [Redux 4.2.0, we marked the original `createStore` method as `@deprecated`](https://github.com/reduxjs/redux/releases/tag/v4.2.0). Strictly speaking, **this is _not_ a breaking change**, nor is it new in 5.0, but we're documenting it here for completeness.

**This deprecation is solely a _visual_ indicator that is meant to encourage users to [migrate their apps from legacy Redux patterns to use the modern Redux Toolkit APIs](https://redux.js.org/usage/migrating-to-modern-redux)**.

The deprecation results in a **visual strikethrough** when imported and used, like **~~`createStore`~~**, but with **_no_ runtime errors or warnings**.

**`createStore` will continue to work indefinitely, and will _not_ ever be removed**. But, today we want _all_ Redux users to be using Redux Toolkit for all of their Redux logic.

To fix this, there are three options:

- **[Follow our strong suggestion to switch over to Redux Toolkit and `configureStore`](https://redux.js.org/usage/migrating-to-modern-redux)**
- Do nothing. It's just a visual strikethrough, and it doesn't affect how your code behaves. Ignore it.
- Switch to using the `legacy_createStore` API that is now exported, which is the exact same function but with no `@deprecated` tag. The simplest option is to do an aliased import rename, like `import { legacy_createStore as createStore } from 'redux'`

<div class="typescript-only">

#### Typescript rewrite

In 2019, we began a community-powered conversion of the Redux codebase to TypeScript. The original effort was discussed in [#3500: Port to TypeScript](https://github.com/reduxjs/redux/issues/3500), and the work was integrated in PR [#3536: Convert to TypeScript](https://github.com/reduxjs/redux/issues/3536).

However, the TS-converted code sat around in the repo for several years, unused and unpublished, due to concerns about possible compatibility issues with the existing ecosystem (as well as general inertia on our part).

Redux core v5 is now built from that TS-converted source code. In theory, this should be almost identical in both runtime behavior and types to the 4.x build, but it's very likely that some of the changes may cause types issues.

Please report any unexpected compatibility issues on [Github](https://github.com/reduxjs/redux/issues)!

#### `AnyAction` deprecated in favour of `UnknownAction`

The Redux TS types have always exported an `AnyAction` type, which is defined to have `{type: string}` and treat any other field as `any`. This makes it easy to write uses like `console.log(action.whatever)`, but unfortunately does not provide any meaningful type safety.

We now export an `UnknownAction` type, which treats all fields other than `action.type` as `unknown`. This encourages users to write type guards that check the action object and assert its _specific_ TS type. Inside of those checks, you can access a field with better type safety.

`UnknownAction` is now the default any place in the Redux source that expects an action object.

`AnyAction` still exists for compatibility, but has been marked as deprecated.

Note that [Redux Toolkit's action creators have a `.match()` method](https://redux-toolkit.js.org/api/createAction#actioncreatormatch) that acts as a useful type guard:

```ts
if (todoAdded.match(someUnknownAction)) {
  // action is now typed as a PayloadAction<Todo>
}
```

You can also use the new `isAction` util to check if an unknown value is some kind of action object.

#### `Middleware` type changed - Middleware `action` and `next` are typed as `unknown`

Previously, the `next` parameter is typed as the `D` type parameter passed, and `action` is typed as the `Action` extracted from the dispatch type. Neither of these are a safe assumption:

- `next` would be typed to have **all** of the dispatch extensions, including the ones earlier in the chain that would no longer apply.
  - Technically it would be _mostly_ safe to type `next` as the default Dispatch implemented by the base redux store, however this would cause `next(action)` to error (as we cannot promise `action` is actually an `Action`) - and it wouldn't account for any following middlewares that return anything other than the action they're given when they see a specific action.
- `action` is not necessarily a known action, it can be literally anything - for example a thunk would be a function with no `.type` property (so `AnyAction` would be inaccurate)

We've changed `next` to be `(action: unknown) => unknown` (which is accurate, we have no idea what `next` expects or will return), and changed the `action` parameter to be `unknown` (which as above, is accurate).

In order to safely interact with values or access fields inside of the `action` argument, you must first do a type guard check to narrow the type, such as `isAction(action)` or `someActionCreator.match(action)`.

This new type is incompatible with the v4 `Middleware` type, so if a package's middleware is saying it's incompatible, check which version of Redux it's getting its types from! (See [overriding dependencies](#overriding-dependencies) later in this page.)

#### `PreloadedState` type removed in favour of `Reducer` generic

We've made tweaks to the TS types to improve type safety and behavior.

First, the `Reducer` type now has a `PreloadedState` possible generic:

```ts
type Reducer<S, A extends Action, PreloadedState = S> = (
  state: S | PreloadedState | undefined,
  action: A
) => S
```

Per the explanation in [#4491](https://github.com/reduxjs/redux/pull/4491):

Why the need for this change? When the store is first created by `createStore`/`configureStore`, the initial state is set to whatever is passed as the `preloadedState` argument (or `undefined` if nothing is passed). That means that the first time that the reducer is called, it is called with the `preloadedState`. After the first call, the reducer is always passed the current state (which is `S`).

For most normal reducers, `S | undefined` accurately describes what can be passed in for the `preloadedState`. However the `combineReducers` function allows for a preloaded state of `Partial<S> | undefined`.

The solution is to have a separate generic that represents what the reducer accepts for its preloaded state. That way `createStore` can then use that generic for its `preloadedState` argument.

Previously, this was handled by a `$CombinedState` type, but that complicated things and led to some user-reported issues. This removes the need for `$CombinedState` altogether.

This change does include some breaking changes, but overall should not have a huge impact on users upgrading in user-land:

- The `Reducer`, `ReducersMapObject`, and `createStore`/`configureStore` types/function take an additional `PreloadedState` generic which defaults to `S`.
- The overloads for `combineReducers` are removed in favor of a single function definition that takes the `ReducersMapObject` as its generic parameter. Removing the overloads was necessary with these changes, since sometimes it was choosing the wrong overload.
- Enhancers that explicitly list the generics for the reducer will need to add the third generic.

</div>

### Toolkit only

#### Object syntax for `createSlice.extraReducers` and `createReducer` removed

RTK's `createReducer` API was originally designed to accept a lookup table of action type strings to case reducers, like `{ "ADD_TODO": (state, action) => {} }`. We later added the "builder callback" form to allow more flexibility in adding "matchers" and a default handler, and did the same for `createSlice.extraReducers`.

We have removed the "object" form for both `createReducer` and `createSlice.extraReducers` in RTK 2.0, as the builder callback form is effectively the same number of lines of code, and works much better with TypeScript.

As an example, this:

```ts
const todoAdded = createAction('todos/todoAdded')

createReducer(initialState, {
  [todoAdded]: (state, action) => {}
})

createSlice({
  name,
  initialState,
  reducers: {
    /* case reducers here */
  },
  extraReducers: {
    [todoAdded]: (state, action) => {}
  }
})
```

should be migrated to:

```ts
createReducer(initialState, builder => {
  builder.addCase(todoAdded, (state, action) => {})
})

createSlice({
  name,
  initialState,
  reducers: {
    /* case reducers here */
  },
  extraReducers: builder => {
    builder.addCase(todoAdded, (state, action) => {})
  }
})
```

##### Codemods

To simplify upgrading codebases, we've published a set of codemods that will automatically transform the deprecated "object" syntax into the equivalent "builder" syntax.

The codemods package is available on NPM as [`@reduxjs/rtk-codemods`](https://www.npmjs.com/package/@reduxjs/rtk-codemods). More details are available [here](https://redux-toolkit.js.org/api/codemods).

To run the codemods against your codebase, run `npx @reduxjs/rtk-codemods <TRANSFORM NAME> path/of/files/ or/some**/*glob.js.`

Examples:

```sh
npx @reduxjs/rtk-codemods createReducerBuilder ./src

npx @reduxjs/rtk-codemods createSliceBuilder ./packages/my-app/**/*.ts
```

We also recommend re-running Prettier on the codebase before committing the changes.

These codemods should work, but we would greatly appreciate feedback from more real-world codebases!

#### `configureStore.middleware` must be a callback

Since the beginning, `configureStore` has accepted a direct array value as the `middleware` option. However, providing an array directly prevents `configureStore` from calling `getDefaultMiddleware()`. So, `middleware: [myMiddleware]` means there is no thunk middleware added (or any of the dev-mode checks).

This is a footgun, and we've had numerous users accidentally do this and cause their apps to fail because the default middleware never got configured.

As a result, we've now made the `middleware` only accept the callback form. _If_ for some reason you still want to replace _all_ of the built-in middleware, do so by returning an array from the callback:

```ts
const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware => {
    // WARNING: this means that _none_ of the default middleware are added!
    return [myMiddleware]
    // or for TS users, use:
    // return new Tuple(myMiddleware)
  }
})
```

But note that **we consistently recommend not replacing the default middleware entirely**, and that you should use `return getDefaultMiddleware().concat(myMiddleware)`.

#### `configureStore.enhancers` must be a callback

Similarly to `configureStore.middleware`, the `enhancers` field must also be a callback, for the same reasons.

The callback will receive a `getDefaultEnhancers` function that can be used to customise the batching enhancer [that's now included by default](#configurestore-adds-autobatchenhancer-by-default).

For example:

```ts
const store = configureStore({
  reducer,
  enhancers: getDefaultEnhancers => {
    return getDefaultEnhancers({
      autoBatch: { type: 'tick' }
    }).concat(myEnhancer)
  }
})
```

It's important to note that the result of `getDefaultEnhancers` will **also** contain the middleware enhancer created with any configured/default middleware. To help prevent mistakes, `configureStore` will log an error to console if middleware was provided and the middleware enhancer wasn't included in the callback result.

```ts
const store = configureStore({
  reducer,
  enhancers: getDefaultEnhancers => {
    return [myEnhancer] // we've lost the  middleware here
    // instead:
    return getDefaultEnhancers().concat(myEnhancer)
  }
})
```

#### Standalone `getDefaultMiddleware` and `getType` removed

The standalone version of `getDefaultMiddleware` has been deprecated since v1.6.1, and has now been removed. Use the function passed to the `middleware` callback instead, which has the correct types.

We have also removed the `getType` export, which was used to extract a type string from action creators made with `createAction`. Instead, use the static property `actionCreator.type`.

#### RTK Query behaviour changes

We've had a number of reports where RTK Query had issues around usage of `dispatch(endpoint.initiate(arg, {subscription: false}))`. There were also reports that multiple triggered lazy queries were resolving the promises at the wrong time. Both of these had the same underlying issue, which was that RTKQ wasn't tracking cache entries in these cases (intentionally). We've reworked the logic to always track cache entries (and remove them as needed), which should resolve those behavior issues.

We also have had issues raised about trying to run multiple mutations in a row and how tag invalidation behaves. RTKQ now has internal logic to delay tag invalidation briefly, to allow multiple invalidations to get handled together. This is controlled by a new `invalidationBehavior: 'immediate' | 'delayed'` flag on `createApi`. The new default behavior is `'delayed'`. Set it to `'immediate'` to revert to the behavior in RTK 1.9.

In RTK 1.9, we reworked RTK Query's internals to keep most of the subscription status inside the RTKQ middleware. The values are still synced to the Redux store state, but this is primarily for display by the Redux DevTools "RTK Query" panel. Related to the cache entry changes above, we've optimized how often those values get synced to the Redux state for perf.

#### `reactHooksModule` custom hook configuration

Previously, custom versions of React Redux's hooks (`useSelector`, `useDispatch`, and `useStore`) could be passed separately to `reactHooksModule`, usually to enable using a different context to the default `ReactReduxContext`.

In practicality, the react hooks module needs all three of these hooks to be provided, and it became an easy mistake to only pass `useSelector` and `useDispatch`, without `useStore`.

The module has now moved all three of these under the same configuration key, and will check that all three are provided if the key is present.

```ts
// previously
const customCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    useDispatch: createDispatchHook(MyContext),
    useSelector: createSelectorHook(MyContext),
    useStore: createStoreHook(MyContext)
  })
)

// now
const customCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    hooks: {
      useDispatch: createDispatchHook(MyContext),
      useSelector: createSelectorHook(MyContext),
      useStore: createStoreHook(MyContext)
    }
  })
)
```

#### Error message extraction

Redux 4.1.0 optimized its bundle size by [extracting error message strings out of production builds](https://github.com/reduxjs/redux/releases/tag/v4.1.0), based on React's approach. We've applied the same technique to RTK. This saves about 1000 bytes from prod bundles (actual benefits will depend on which imports are being used).

<div class="typescript-only">

#### `configureStore` field order for `middleware` matters

If you are passing _both_ the `middleware` and `enhancers` fields to `configureStore`, the `middleware` field _must_ come first in order for internal TS inference to work properly.

#### Non-default middleware/enhancers must use `Tuple`

We've seen many cases where users passing the `middleware` parameter to configureStore have tried spreading the array returned by `getDefaultMiddleware()`, or passed an alternate plain array. This unfortunately loses the exact TS types from the individual middleware, and often causes TS problems down the road (such as `dispatch` being typed as `Dispatch<AnyAction>` and not knowing about thunks).

`getDefaultMiddleware()` already used an internal `MiddlewareArray` class, an `Array` subclass that had strongly typed `.concat/prepend()` methods to correctly capture and retain the middleware types.

We've renamed that type to `Tuple`, and `configureStore`'s TS types now require that you _must_ use `Tuple` if you want to pass your own array of middleware:

```ts
import { configureStore, Tuple } from '@reduxjs/toolkit'

configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => new Tuple(additionalMiddleware, logger)
})
```

(Note that this has no effect if you're using RTK with plain JS, and you could still pass a plain array here.)

This same restriction applies to the `enhancers` field.

#### Entity adapter type updates

`createEntityAdapter` now has an `Id` generic argument, which will be used to strongly type the item IDs anywhere those are exposed. Previously, the ID field type was always `string | number`. TS will now try to infer the exact type from either the `.id` field of your entity type, or the `selectId` return type. You could also fall back to passing that generic type directly. **If you use the `EntityState<Data, Id>` type directly, you _must_ supply both generic arguments!**

The `.entities` lookup table is now defined to use a standard TS `Record<Id, MyEntityType>`, which assumes that each item lookup exists by default. Previously, it used a `Dictionary<MyEntityType>` type, which assumed the result was `MyEntityType | undefined`. The `Dictionary` type has been removed.

If you prefer to assume that the lookups _might_ be undefined, use TypeScript's `noUncheckedIndexedAccess` configuration option to control that.

</div>

### Reselect

#### `createSelector` Uses `weakMapMemoize` As Default Memoizer

**`createSelector` now uses a new default memoization function called `weakMapMemoize`**. This memoizer offers an effectively infinite cache size, which should simplify usage with varying arguments, but relies exclusively on reference comparisons.

If you need to customize equality comparisons, customize `createSelector` to use the original `lruMemoize` method instead:

```ts no-emit
createSelector(inputs, resultFn, {
  memoize: lruMemoize,
  memoizeOptions: { equalityCheck: yourEqualityFunction }
})
```

#### `defaultMemoize` Renamed to `lruMemoize`

Since the original `defaultMemoize` function is no longer actually the default, we've renamed it to `lruMemoize` for clarity. This only matters if you specifically imported it into your app to customize selectors.

#### `createSelector` Dev-Mode Checks

`createSelector` now does checks in development mode for common mistakes, like input selectors that always return new references, or result functions that immediately return their argument. These checks can be customized at selector creation or globally.

This is important, as an input selector returning a materially different result with the same parameters means that the output selector will never memoize correctly and be run unnecessarily, thus (potentially) creating a new result and causing rerenders.

```ts
const addNumbers = createSelector(
  // this input selector will always return a new reference when run
  // so cache will never be used
  (a, b) => ({ a, b }),
  ({ a, b }) => ({ total: a + b })
)
// instead, you should have an input selector for each stable piece of data
const addNumbersStable = createSelector(
  (a, b) => a,
  (a, b) => b,
  (a, b) => ({
    total: a + b
  })
)
```

This is done the first time the selector is called, unless configured otherwise. More details are available in the [Reselect docs on dev-mode checks](https://reselect.js.org/api/development-only-stability-checks).

Note that while RTK re-exports `createSelector`, it intentionally does not re-export the function to configure this check globally - if you wish to do so, you should instead depend on `reselect` directly and import it yourself.

<div class="typescript-only">

#### `ParametricSelector` Types Removed

The `ParametricSelector` and `OutputParametricSelector` types have been removed. Use `Selector` and `OutputSelector` instead.

</div>

### React-Redux

#### Requires React 18

React-Redux v7 and v8 worked with all versions of React that supported hooks (16.8+, 17, and 18). v8 switched from internal subscription management to React's new `useSyncExternalStore` hook, but used the "shim" implementation to provide support for React 16.8 and 17, which did not have that hook built in.

**React-Redux v9 switches to _requiring_ React 18, and does _not_ support React 16 or 17**. This allows us to drop the shim and save a small bit of bundle size.

### Redux Thunk

#### Thunk Uses Named Exports

The `redux-thunk` package previously used a single default export that was the middleware, with an attached field named `withExtraArgument` that allowed customization.

The default export has been removed. There are now two named exports: `thunk` (the basic middleware) and `withExtraArgument`.

If you are using Redux Toolkit, this should have no effect, as RTK already handles this inside of `configureStore`.

## New Features

These features are new in Redux Toolkit 2.0, and help cover additional use cases that we've seen users ask for in the ecosystem.

### `combineSlices` API with slice reducer injection for code-splitting

The Redux core has always included `combineReducers`, which takes an object full of "slice reducer" functions and generates a reducer that calls those slice reducers. RTK's `createSlice` generates slice reducers + associated action creators, and we've taught the pattern of exporting individual action creators as named exports and the slice reducer as a default export. Meanwhile, we've never had official support for lazy-loading reducers, although we've had [sample code for some "reducer injection" patterns in our docs](https://redux.js.org/usage/code-splitting).

This release includes a new [`combineSlices`](https://redux-toolkit.js.org/api/combineSlices) API that is designed to enable lazy-loading of reducers at runtime. It accepts individual slices or an object full of slices as arguments, and automatically calls `combineReducers` using the `sliceObject.name` field as the key for each state field. The generated reducer function has an additional `.inject()` method attached that can be used to dynamically inject additional slices at runtime. It also includes a `.withLazyLoadedSlices()` method that can be used to generate TS types for reducers that will be added later. See [#2776](https://github.com/reduxjs/redux-toolkit/issues/2776) for the original discussion around this idea.

For now, we are not building this into `configureStore`, so you'll need to call `const rootReducer = combineSlices(.....)` yourself and pass that to `configureStore({reducer: rootReducer})`.

**Basic usage: a mixture of slices and standalone reducers passed to `combineSlices`**

```ts
const stringSlice = createSlice({
  name: 'string',
  initialState: '',
  reducers: {}
})

const numberSlice = createSlice({
  name: 'number',
  initialState: 0,
  reducers: {}
})

const booleanReducer = createReducer(false, () => {})

const api = createApi(/*  */)

const combinedReducer = combineSlices(
  stringSlice,
  {
    num: numberSlice.reducer,
    boolean: booleanReducer
  },
  api
)
expect(combinedReducer(undefined, dummyAction())).toEqual({
  string: stringSlice.getInitialState(),
  num: numberSlice.getInitialState(),
  boolean: booleanReducer.getInitialState(),
  api: api.reducer.getInitialState()
})
```

**Basic slice reducer injection**

```ts
// Create a reducer with a TS type that knows `numberSlice` will be injected
const combinedReducer =
  combineSlices(stringSlice).withLazyLoadedSlices<
    WithSlice<typeof numberSlice>
  >()

// `state.number` doesn't exist initially
expect(combinedReducer(undefined, dummyAction()).number).toBe(undefined)

// Create a version of the reducer with `numberSlice` injected (mainly useful for types)
const injectedReducer = combinedReducer.inject(numberSlice)

// `state.number` now exists, and injectedReducer's type no longer marks it as optional
expect(injectedReducer(undefined, dummyAction()).number).toBe(
  numberSlice.getInitialState()
)

// original reducer has also been changed (type is still optional)
expect(combinedReducer(undefined, dummyAction()).number).toBe(
  numberSlice.getInitialState()
)
```

### `selectors` field in `createSlice`

The existing `createSlice` API now has support for defining [`selectors`](https://redux-toolkit.js.org/api/createSlice#selectors) directly as part of the slice. By default, these will be generated with the assumption that the slice is mounted in the root state using `slice.name` as the field, such as `name: "todos"` -> `rootState.todos`. Additionally, there's now a `slice.selectSlice` method that does that default root state lookup.

You can call `sliceObject.getSelectors(selectSliceState)` to generate the selectors with an alternate location, similar to how `entityAdapter.getSelectors()` works.

```ts
const slice = createSlice({
  name: 'counter',
  initialState: 42,
  reducers: {},
  selectors: {
    selectSlice: state => state,
    selectMultiple: (state, multiplier: number) => state * multiplier
  }
})

// Basic usage
const testState = {
  [slice.name]: slice.getInitialState()
}
const { selectSlice, selectMultiple } = slice.selectors
expect(selectSlice(testState)).toBe(slice.getInitialState())
expect(selectMultiple(testState, 2)).toBe(slice.getInitialState() * 2)

// Usage with the slice reducer mounted under a different key
const customState = {
  number: slice.getInitialState()
}
const { selectSlice, selectMultiple } = slice.getSelectors(
  (state: typeof customState) => state.number
)
expect(selectSlice(customState)).toBe(slice.getInitialState())
expect(selectMultiple(customState, 2)).toBe(slice.getInitialState() * 2)
```

### `createSlice.reducers` callback syntax and thunk support

One of the oldest feature requests we've had is the ability to declare thunks directly inside of `createSlice`. Until now, you've always had to declare them separately, give the thunk a string action prefix, and handle the actions via `createSlice.extraReducers`:

```ts
// Declare the thunk separately
const fetchUserById = createAsyncThunk(
  'users/fetchByIdStatus',
  async (userId: number, thunkAPI) => {
    const response = await userAPI.fetchById(userId)
    return response.data
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchUserById.fulfilled, (state, action) => {
      state.entities.push(action.payload)
    })
  }
})
```

Many users have told us that this separation feels awkward.

We've _wanted_ to include a way to define thunks directly inside of `createSlice`, and have played around with various prototypes. There were always two major blocking issues, and a secondary concern:

1. It wasn't clear what the syntax for declaring a thunk inside should look like.
2. Thunks have access to `getState` and `dispatch`, but the `RootState` and `AppDispatch` types are normally inferred from the store, which in turn infers it from the slice state types. Declaring thunks inside `createSlice` would cause circular type inference errors, as the store needs the slice types but the slice needs the store types. We weren't willing to ship an API that would work okay for our JS users but not for our TS users, especially since we _want_ people to use TS with RTK.
3. You can't do synchronous conditional imports in ES modules, and there's no good way to make the `createAsyncThunk` import optional. Either `createSlice` always depends on it (and adds that to the bundle size), or it can't use `createAsyncThunk` at all.

We've settled on these compromises:

- **In order to create async thunks with `createSlice`, you specifically need to [set up a custom version of `createSlice` that has access to `createAsyncThunk`](https://redux-toolkit.js.org/api/createSlice#createasyncthunk)**.
- You can declare thunks inside of `createSlice.reducers`, by using a "creator callback" syntax for the `reducers` field that is similar to the `build` callback syntax in RTK Query's `createApi` (using typed functions to create fields in an object). Doing this does look a bit different than the existing "object" syntax for the `reducers` field, but is still fairly similar.
- You can customize _some_ of the types for thunks inside of `createSlice`, but you _cannot_ customize the `state` or `dispatch` types. If those are needed, you can manually do an `as` cast, like `getState() as RootState`.

In practice, we hope these are reasonable tradeoffs. Creating thunks inside of `createSlice` has been widely asked for, so we think it's an API that will see usage. If the TS customization options are a limitation, you can still declare thunks outside of `createSlice` as always, and most async thunks don't need `dispatch` or `getState` - they just fetch data and return. And finally, setting up a custom `createSlice` allows you to opt into `createAsyncThunk` being included in your bundle size (though it may already be included if used directly or as part of RTK Query - in either of these cases there's no _additional_ bundle size).

Here's what the new callback syntax looks like:

```ts
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator }
})

const todosSlice = createSliceWithThunks({
  name: 'todos',
  initialState: {
    loading: false,
    todos: [],
    error: null
  } as TodoState,
  reducers: create => ({
    // A normal "case reducer", same as always
    deleteTodo: create.reducer((state, action: PayloadAction<number>) => {
      state.todos.splice(action.payload, 1)
    }),
    // A case reducer with a "prepare callback" to customize the action
    addTodo: create.preparedReducer(
      (text: string) => {
        const id = nanoid()
        return { payload: { id, text } }
      },
      // action type is inferred from prepare callback
      (state, action) => {
        state.todos.push(action.payload)
      }
    ),
    // An async thunk
    fetchTodo: create.asyncThunk(
      // Async payload function as the first argument
      async (id: string, thunkApi) => {
        const res = await fetch(`myApi/todos?id=${id}`)
        return (await res.json()) as Item
      },
      // An object containing `{pending?, rejected?, fulfilled?, settled?, options?}` second
      {
        pending: state => {
          state.loading = true
        },
        rejected: (state, action) => {
          state.error = action.payload ?? action.error
        },
        fulfilled: (state, action) => {
          state.todos.push(action.payload)
        },
        // settled is called for both rejected and fulfilled actions
        settled: (state, action) => {
          state.loading = false
        }
      }
    )
  })
})

// `addTodo` and `deleteTodo` are normal action creators.
// `fetchTodo` is the async thunk
export const { addTodo, deleteTodo, fetchTodo } = todosSlice.actions
```

#### Codemod

**Using the new callback syntax is entirely optional (the object syntax is still standard)**, but an existing slice would need to be converted before it can take advantage of the new capabilities this syntax provides. To make this easier, a [codemod](https://redux-toolkit.js.org/api/codemods) is provided.

```sh
npx @reduxjs/rtk-codemods createSliceReducerBuilder ./src/features/todos/slice.ts
```

### "Dynamic middleware" middleware

A Redux store's middleware pipeline is fixed at store creation time and can't be changed later. We _have_ seen ecosystem libraries that tried to allow dynamically adding and removing middleware, potentially useful for things like code splitting.

This is a relatively niche use case, but we've built [our own version of a "dynamic middleware" middleware](https://redux-toolkit.js.org/api/createDynamicMiddleware). Add it to the Redux store at setup time, and it lets you add middleware later at runtime. It also comes with a [React hook integration that will automatically add a middleware to the store and return the updated dispatch method.](https://redux-toolkit.js.org/api/createDynamicMiddleware#react-integration).

```ts
import { createDynamicMiddleware, configureStore } from '@reduxjs/toolkit'

const dynamicMiddleware = createDynamicMiddleware()

const store = configureStore({
  reducer: {
    todos: todosReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(dynamicMiddleware.middleware)
})

// later
dynamicMiddleware.addMiddleware(someOtherMiddleware)
```

### `configureStore` adds `autoBatchEnhancer` by default

[In v1.9.0, we added a new `autoBatchEnhancer`](https://github.com/reduxjs/redux-toolkit/releases/tag/v1.9.0) that delays notifying subscribers briefly when multiple "low-priority" actions are dispatched in a row. This improves perf, as UI updates are typically the most expensive part of the update process. RTK Query marks most of its own internal actions as "low-pri" by default, but you have to have the `autoBatchEnhancer` added to the store to benefit from that.

We've updated `configureStore` to add the `autoBatchEnhancer` to the store setup by default, so that users can benefit from the improved perf without needing to manually tweak the store config themselves.

### `entityAdapter.getSelectors` accepts a `createSelector` function

[`entityAdapter.getSelectors()`](https://redux-toolkit.js.org/api/createEntityAdapter#selector-functions) now accepts an options object as its second argument. This allows you to pass in your own preferred `createSelector` method, which will be used to memoize the generated selectors. This could be useful if you want to use one of Reselect's new alternate memoizers, or some other memoization library with an equivalent signature.

### Immer 10.0

[Immer 10.0](https://github.com/immerjs/immer/releases/tag/v10.0.0) is now final, and has several major improvements and updates:

- Much faster update perf
- Much smaller bundle size
- Better ESM/CJS package formatting
- No default export
- No ES5 fallback

We've updated RTK to depend on the final Immer 10.0 release.

### Next.js Setup Guide

We now have a docs page that covers [how to set up Redux properly with Next.js](https://redux.js.org/usage/nextjs). We've seen a lot of questions around using Redux, Next, and the App Router together, and this guide should help provide advice.

(At this time, the Next.js `with-redux` example is still showing outdated patterns - we're going to file a PR shortly to update that to match our docs guide.)

## Overriding dependencies

It will take a while for packages to update their peer dependencies to allow for Redux core 5.0, and in the meantime changes like the [Middleware type](#middleware-type-changed---middleware-action-and-next-are-typed-as-unknown) will result in perceived incompatibilities.

It's likely that most libraries will not actually have any practices that are incompatible with 5.0, but due to the peer dependency on 4.0 they end up pulling in old type declarations.

This can be solved by manually overriding the dependency resolution, which is supported by both `npm` and `yarn`.

### `npm` - `overrides`

NPM supports this through an [`overrides`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) field in your `package.json`. You can override the dependency for a specific package, or make sure that every package that pulls in Redux receives the same version.

```json title="Individual override - redux-persist"
{
  "overrides": {
    "redux-persist": {
      "redux": "^5.0.0"
    }
  }
}
```

```json title="Blanket override"
{
  "overrides": {
    "redux": "^5.0.0"
  }
}
```

### `yarn` - `resolutions`

Yarn supports this through a [`resolutions`](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/) field in your `package.json`. Just like with NPM, you can override the dependency for a specific package, or make sure that every package that pulls in Redux receives the same version.

```json title="Individual override - redux-persist"
{
  "resolutions": {
    "redux-persist/redux": "^5.0.0"
  }
}
```

```json title="Blanket override"
{
  "resolutions": {
    "redux": "^5.0.0"
  }
}
```

## Recommendations

Based on changes in 2.0 and previous versions, there have been some shifts in thinking that are good to know about, if non-essential.

### Alternatives to `actionCreator.toString()`

As part of RTK's original API, action creators made with `createAction` have a custom `toString()` override that returns the action type.

This was primarily useful for the ([now removed](#object-syntax-for-createsliceextrareducers-and-createreducer-removed)) object syntax for `createReducer`:

```ts
const todoAdded = createAction<Todo>('todos/todoAdded')

createReducer(initialState, {
  [todoAdded]: (state, action) => {} // toString called here, 'todos/todoAdded'
})
```

While this was convenient (and other libraries in the Redux ecosystem such as `redux-saga` and `redux-observable` have supported this to various capacities), it didn't play well with Typescript and was generally a bit too "magic".

```ts
const test = todoAdded.toString()
//    ^? typed as string, rather than specific action type
```

Over time, the action creator also gained a static `type` property and `match` method which were more explicit and worked better with Typescript.

```ts
const test = todoAdded.type
//    ^? 'todos/todoAdded'

// acts as a type predicate
if (todoAdded.match(unknownAction)) {
  unknownAction.payload
  // ^? now typed as PayloadAction<Todo>
}
```

For compatibility, this override is still in place, but we encourage considering using either of the static properties for more understandable code.

For example, with `redux-observable`:

```ts
// before (works in runtime, will not filter types properly)
const epic = (action$: Observable<Action>) =>
  action$.pipe(
    ofType(todoAdded),
    map(action => action)
    //   ^? still Action<any>
  )

// consider (better type filtering)
const epic = (action$: Observable<Action>) =>
  action$.pipe(
    filter(todoAdded.match),
    map(action => action)
    //   ^? now PayloadAction<Todo>
  )
```

With `redux-saga`:

```ts
// before (still works)
yield takeEvery(todoAdded, saga)

// consider
yield takeEvery(todoAdded.match, saga)
// or
yield takeEvery(todoAdded.type, saga)
```

## Future plans

### Custom slice reducer creators

With the addition of the [callback syntax for createSlice](#callback-syntax-for-createslicereducers), the [suggestion](https://github.com/reduxjs/redux-toolkit/issues/3837) was made to enable custom slice reducer creators. These creators would be able to:

- Modify reducer behaviour by adding case or matcher reducers
- Attach actions (or any other useful functions) to `slice.actions`
- Attach provided case reducers to `slice.caseReducers`

The creator would need to first return a "definition" shape when `createSlice` is first called, which it then handles by adding any necessary reducers and/or actions.

An API for this is not set in stone, but the existing `create.asyncThunk` creator implemented with a potential API could look like:

```js
const asyncThunkCreator = {
  type: ReducerType.asyncThunk,
  define(payloadCreator, config) {
    return {
      type: ReducerType.asyncThunk, // needs to match reducer type, so correct handler can be called
      payloadCreator,
      ...config
    }
  },
  handle(
    {
      // the key the reducer was defined under
      reducerName,
      // the autogenerated action type, i.e. `${slice.name}/${reducerName}`
      type
    },
    // the definition from define()
    definition,
    // methods to modify slice
    context
  ) {
    const { payloadCreator, options, pending, fulfilled, rejected, settled } =
      definition
    const asyncThunk = createAsyncThunk(type, payloadCreator, options)

    if (pending) context.addCase(asyncThunk.pending, pending)
    if (fulfilled) context.addCase(asyncThunk.fulfilled, fulfilled)
    if (rejected) context.addCase(asyncThunk.rejected, rejected)
    if (settled) context.addMatcher(asyncThunk.settled, settled)

    context.exposeAction(reducerName, asyncThunk)
    context.exposeCaseReducer(reducerName, {
      pending: pending || noop,
      fulfilled: fulfilled || noop,
      rejected: rejected || noop,
      settled: settled || noop
    })
  }
}

const createSlice = buildCreateSlice({
  creators: {
    asyncThunk: asyncThunkCreator
  }
})
```

We're not sure how many people/libraries would actually make use of this though, so any feedback over on the [Github issue](https://github.com/reduxjs/redux-toolkit/issues/3837) is welcome!

### `createSlice.selector` selector factories

There have been some concerns raised internally about whether `createSlice.selectors` supports memoized selectors sufficiently. You can provide a memoized selector to your `createSlice.selectors` configuration, but you're stuck with that one instance.

```ts
const todoSlice = createSlice({
  name: 'todos',
  initialState: {
    todos: [] as Todo[]
  },
  reducers: {},
  selectors: {
    selectTodosByAuthor = createSelector(
      (state: TodoState) => state.todos,
      (state: TodoState, author: string) => author,
      (todos, author) => todos.filter(todo => todo.author === author)
    )
  }
})

export const { selectTodosByAuthor } = todoSlice.selectors
```

With `createSelector`'s default cache size of 1, this can cause caching issues if called in multiple components with different arguments. One typical solution for this (without `createSlice`) is a [selector factory](https://redux.js.org/usage/deriving-data-selectors#creating-unique-selector-instances):

```ts
export const makeSelectTodosByAuthor = () =>
  createSelector(
    (state: RootState) => state.todos.todos,
    (state: RootState, author: string) => author,
    (todos, author) => todos.filter(todo => todo.author === author)
  )

function AuthorTodos({ author }: { author: string }) {
  const selectTodosByAuthor = useMemo(makeSelectTodosByAuthor, [])
  const todos = useSelector(state => selectTodosByAuthor(state, author))
}
```

Of course, with `createSlice.selectors` this is no longer possible, as you need the selector instance when creating your slice.

In 2.0.0 we have no set solution for this - a few APIs have been floated ([PR 1](https://github.com/reduxjs/redux-toolkit/pull/3671), [PR 2](https://github.com/reduxjs/redux-toolkit/pull/3836)) but nothing was decided upon. If this is something you'd like to see supported, consider providing feedback in the [Github discussion](https://github.com/reduxjs/redux-toolkit/discussions/3387)!

### 3.0 - RTK Query

RTK 2.0 was largely focused on core and toolkit changes. Now that 2.0 is released, we would like to shift our focus to RTK Query, as there are still some rough edges to iron out - some of which may require breaking changes, necessitating a 3.0 release.

If you have any feedback for what that could look like, please consider chiming in at the [RTK Query API pain points and rough spots feedback thread](https://github.com/reduxjs/redux-toolkit/issues/3692)!

</div>
