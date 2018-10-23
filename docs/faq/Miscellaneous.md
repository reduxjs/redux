# Redux FAQ: Miscellaneous

## Table of Contents

- [Are there any larger, “real” Redux projects?](#are-there-any-larger-real-redux-projects)
- [How can I implement authentication in Redux?](#how-can-i-implement-authentication-in-redux)

## Miscellaneous

### Are there any larger, “real” Redux projects?

Yes, lots of them! To name just a few:

- [Twitter's mobile site](https://mobile.twitter.com/)
- [Wordpress's new admin page](https://github.com/Automattic/wp-calypso)
- [Firefox's new debugger](https://github.com/devtools-html/debugger.html)
- [The HyperTerm terminal application](https://github.com/zeit/hyperterm)

And many, many more! The Redux Addons Catalog has **[a list of Redux-based applications and examples](https://github.com/markerikson/redux-ecosystem-links/blob/master/apps-and-examples.md)** that points to a variety of actual applications, large and small.

#### Further information

**Documentation**

- [Introduction: Examples](/docs/introduction/Examples.md)

**Discussions**

- [Reddit: Large open source react/redux projects?](https://www.reddit.com/r/reactjs/comments/496db2/large_open_source_reactredux_projects/)
- [HN: Is there any huge web application built using Redux?](https://news.ycombinator.com/item?id=10710240)

### How can I implement authentication in Redux?

Authentication is essential to any real application. When going about authentication you must keep in mind that nothing changes with how you should organize your application and you should implement authentication in the same way you would any other feature. It is relatively straightforward:

1. Create action constants for `LOGIN_SUCCESS`, `LOGIN_FAILURE`, etc.

2. Create action creators that take in credentials, a flag that signifies whether authentication succeeded, a token, or an error message as the payload.

3. Create an async action creator with Redux Thunk middleware or any middleware you see fit to fire a network request to an API that returns a token if the credentials are valid. Then save the token in the local storage or show a response to the user if it failed. You can perform these side effects from the action creators you wrote in the previous step.

4. Create a reducer that returns the next state for each possible authentication case (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, etc).

#### Further information

**Articles**

- [Authentication with JWT by Auth0](https://auth0.com/blog/2016/01/04/secure-your-react-and-redux-app-with-jwt-authentication/)
- [Tips to Handle Authentication in Redux](https://medium.com/@MattiaManzati/tips-to-handle-authentication-in-redux-2-introducing-redux-saga-130d6872fbe7)

**Examples**

- [react-redux-jwt-auth-example](https://github.com/joshgeller/react-redux-jwt-auth-example)

**Libraries**

- [Redux Addons Catalog: Use Cases - Authentication](https://github.com/markerikson/redux-ecosystem-links/blob/master/use-cases.md#authentication)
