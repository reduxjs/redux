Userland and Core
--------------------------

Modularity of the JavaScript tools and libraries is a tricky subject. As [James Long put it](http://jlongster.com/Modularity), “people have strong opinions about this because modules are how we interact with each other”.

There is a tradeoff between doing too much in a single library versus splitting every function into a module of its own. Redux tries to stay in the middle, guided by practical considerations and the maintainers’ preferences.

Redux started off with React bindings and some middleware included by default, but we have split those into separate packages before 1.0. Right now, this is the checklist a feature has to pass to be included in Redux core:

* We anticipate it will be used by most Redux users in production;
* We are sure its API is good and don’t plan to introduce minor breaking changes to it;
* It doesn’t add much to the library size and introduces no new dependencies;
* It ties Redux contracts together in a beginner-friendly way;
* It plays well with extensions like [Redux DevTools](https://github.com/gaearon/redux-devtools).

[React bindings](http://github.com/gaearon/react-redux) were separated because they add a dependency, increase the core size, but we’re still not sure if its API is good enough, and we will keep iterating on them. Moreover including them with Redux sends a wrong signal that Redux is somehow related to React, which it isn’t.

Similarly, [redux-thunk](https://github.com/gaearon/redux-thunk) was split into a separate project because we’re not sure if it’s the best way of doing async in Redux, and we want to see more userland solutions to this problem.

Some of the best features of Redux are implemented as libraries. For example, [reselect](https://github.com/faassen/reselect) lets you compose nested memoized selectors for super performant view updates. It’s awesome, and we might include it in the core one day when its API is stable, but for now, we want to give it the freedom to evolve without concerning itself with making breaking changes to Redux.

--------------------------
Next: [Why Redux](Why Redux.md)   
