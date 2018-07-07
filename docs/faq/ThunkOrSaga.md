# Redux FAQ: Thunk or Saga

## Table of Contents

- [Should I use Redux-Thunk or Redux-Saga?](#thunk-saga)
- [Where does Redux-Observable, Redux-Loop etc. fit in?](#side-effects-handlers)

## Thunk Or Saga

<a id="thunk-saga"></a>
### Should I use Redux-Thunk or Redux-Saga?

This question arised many times throughout the web and while there is no direct opinion to give you on which model you should use to handle side effects in your redux apps, we feel that there are situations in which Redux-Thunk just fits in perfectly and others where Redux-Saga is best suited for the job.

As a rule of thumb we can say that:

- Thunks are best for complex synchronous logic and simple async logic. With the use of `async/await` the resulting code of some slightly advanced async task should be sufficiently manageable too.
- Sagas give their very best for complex async logic and decoupled "background thread"-type behavior, especially if you need to listen to dispatched actions. In fact one of the main reason why Sagas are best used for complex async, is that they don't only let you dispatch actions (of course), but they allow you to respond and execute some logic against an actions that has been dispatched.

But if you feel that in a specific project Sagas would be an overkill in the development of some features but not in others, **it's absolutely fine for you to use both** to handle your side effects and switch them based on the complexity of the code you're writing. You could even start to write some logic through thunk and at a certain point "convert it" introducing the use of a Saga. Remember that this approach is always preferred to using "one tool for every job"... as the old saying says:

> If your only tool is a hammer, every problem looks like a nail.

For instance, if you're using Redux-Saga for everything, you're probably doing more damage than anything else because Sagas require understanding generator functions, understanding the "effects" that it provides and since Redux-Saga has these own personal "effects", it introduces an unnecessary layer of complexity that decrease the code readability.

#### Further information
**Articles**

- [Redux-Thunk vs Redux-Saga](https://decembersoft.com/posts/redux-thunk-vs-redux-saga/)

**Discussions**

- [React Developer Map by adam-golab ](https://www.reddit.com/r/reactjs/comments/8vglo0/react_developer_map_by_adamgolab/e1nr597/)
- [Stack Overflow: Pros/cons of using redux-saga with ES6 generators vs redux-thunk with ES2017 async/await](https://stackoverflow.com/questions/34930735/pros-cons-of-using-redux-saga-with-es6-generators-vs-redux-thunk-with-es2017-asy)

<a id="side-effects-handlers"></a>
### Where does Redux-Observables, Redux-Loop etc. fit in?

As you may know, there are also other libraries to handle side effects in redux. The other "big" two are, in order of use, Redux-Observables and Redux-Loop. Regarding the use cases of these libraries, you can refer to what has been said for Redux-Sagas, they just introduce different APIs.

Redux-Observables, as the name states already, is a middleware based on RxJS 6: a well known library built around the concept of the Observable and based on the reactive programming paradigm.
It is used in lots of different projects and it may be convenient to learn it instead of Redux-Saga because RxJS is a generic async library and the knowledge you acquire while learning it, is transferable to things other than redux.

Redux-Loop, instead, is a slightly different approach and less used than the other two. It is a port of the Elm language architecture that allows you to sequence your effects naturally and purely by returning them from your reducers.

**Articles**

- [Redux-Saga V.S. Redux-Observable](https://hackmd.io/s/H1xLHUQ8e#side-by-side-comparison)

**Discussions**

- [Stack Overflow: Why use Redux-Observable over Redux-Saga?](https://stackoverflow.com/questions/40021344/why-use-redux-observable-over-redux-saga/40027778#40027778)
