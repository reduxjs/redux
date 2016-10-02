# Redux FAQ: Miscellaneous

## Table of Contents

- [Are there any larger, “real” Redux projects?](#miscellaneous-real-projects)
- [How can I implement authentication in Redux?](#miscellaneous-authentication)



## Miscellaneous

<a id="miscellaneous-real-projects"></a>
### Are there any larger, “real” Redux projects?

The Redux “examples” folder has several sample projects of varying complexity, including a “real-world” example. While many companies are using Redux, most of their applications are proprietary and not available. A large number of Redux-related projects can be found on Github, such as [SoundRedux](https://github.com/andrewngu/sound-redux).

#### Further information

**Documentation**
- [Introduction: Examples](/docs/introduction/Examples.md)

**Discussions**
- [Reddit: Large open source react/redux projects?](https://www.reddit.com/r/reactjs/comments/496db2/large_open_source_reactredux_projects/)
- [HN: Is there any huge web application built using Redux?](https://news.ycombinator.com/item?id=10710240)

<a id="miscellaneous-authentication"></a>
### How can I implement authentication in Redux?

Authentication is essential to any real application. When going about authentication you must keep in mind that nothing changes with how you should organize your application and you should implement authentication in the same way you would any other feature. It is relatively straightforward:

1. Create action constants for `LOGIN_SUCCESS`, `LOGIN_FAILURE`, etc.

2. Create action creators that take in credentials, a flag that signifies whether authentication succeeded, a token, or an error message as the payload.

3. Create an async action creator with Redux Thunk middleware or any middleware you see fit to fire a network request to an API that returns a token if the credentials are valid. Then save the token in the local storage or show a response to the user if it failed. You can perform these side effects from the action creators you wrote in the previous step.

4. Create a reducer that returns the next state for each possible authentication case (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, etc).

#### Further information

**Discussions**
- [Authentication with JWT by Auth0](https://auth0.com/blog/2016/01/04/secure-your-react-and-redux-app-with-jwt-authentication/)
- [Tips to Handle Authentication in Redux](https://medium.com/@MattiaManzati/tips-to-handle-authentication-in-redux-2-introducing-redux-saga-130d6872fbe7)
- [react-redux-jwt-auth-example](https://github.com/joshgeller/react-redux-jwt-auth-example)
- [redux-auth](https://github.com/lynndylanhurley/redux-auth)
