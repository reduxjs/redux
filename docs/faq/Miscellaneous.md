---
id: miscellaneous
title: Miscellaneous
sidebar_label: Miscellaneous
---

## Redux FAQ: Miscellaneous

### Are there any larger, “real” Redux projects?

Yes, lots of them! To name just a few:

- [Twitter / X's web client](https://x.com/)
- [Wordpress's admin page](https://github.com/Automattic/wp-calypso)
- [Firefox's debugger](https://github.com/firefox-devtools/debugger)
- [The Hyper terminal application](https://github.com/vercel/hyper)

And many, many more!

#### Further information

**Documentation**

- [Introduction: Examples](../introduction/Examples.md)

**Discussions**

- [Reddit: Large open source react/redux projects?](https://www.reddit.com/r/reactjs/comments/496db2/large_open_source_reactredux_projects/)
- [HN: Is there any huge web application built using Redux?](https://news.ycombinator.com/item?id=10710240)

### How can I implement authentication in Redux?

Authentication is essential to any real application. When going about authentication you must keep in mind that nothing changes with how you should organize your application and you should implement authentication in the same way you would any other feature. It is relatively straightforward:

1. Create an `auth` slice with `createSlice` that holds the current user and token (or a flag indicating whether the user is logged in), plus loading and error fields for the login request.

2. Make the login request either with an [RTK Query mutation](/toolkit/rtk-query/usage/mutations) or with a [`createAsyncThunk`](/toolkit/api/createAsyncThunk) that takes the credentials and returns the token. Handle the pending, fulfilled, and rejected cases in the slice's `extraReducers` (or with `addMatcher` for the mutation's lifecycle actions) to save the token or the error message.

3. Read the token from the store when making other requests. With RTK Query, do this in `baseQuery`'s [`prepareHeaders`](/toolkit/rtk-query/api/fetchBaseQuery#setting-default-headers-on-requests) callback, which receives `getState`. For other code that needs the token outside a component, see [How can I use the Redux store in non-component files?](./CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files).

4. If you want the session to survive a page reload, persist the token from a [listener middleware](/toolkit/api/createListenerMiddleware) effect that runs when the login succeeds, and read it back into `preloadedState` when you create the store.

#### Further information

**Documentation**

- [RTK Query: Authentication example](/toolkit/rtk-query/usage/examples#authentication)

**Articles**

- [Authentication with JWT by Auth0](https://auth0.com/blog/secure-your-react-and-redux-app-with-jwt-authentication/) (2016, uses `connect` and hand-written thunks; the overall flow still applies)
