Why Redux
--------------------------

Redux was an experiment in taking Flux concepts and tweaking them until [hot reloading, record and replay, and time travel as demoed in Dan’s talk](http://youtube.com/watch?v=xsSnOQynTHs) are easy to implement in userland. Redux proved to be successful in its own right, but it’s important to understand its roots and initial focus.

There are a few key design decisions behind Redux that are “set in stone” and won’t change. Whether you agree with them or not, it’s good to understand them before choosing in favor of Redux or against it.

* The only way to mutate the state is by dispatching a plain object called “action”.
* It should be possible to implement the [developer tools with hot reloading and time travel](http://github.com/gaearon/redux-devtools) outside the core.
* For universal apps and developer tools, it should be possible to serialize all state to an object and later hydrate it.
* We should play nice with libraries like Rx, and Immutable, but not enforce using them.
* The API surface should be minimal. Most of your code should be portable to the “next thing” whatever it is.
* It should be easy to test all parts of your code without mocking.

--------------------------

Done with the basics?  
Check out [the practical recipes](../Recipes), [the glossary and the full API reference](../Reference), and [the community resources](../Resources).
