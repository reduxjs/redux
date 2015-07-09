### Philosophy & Design Goals

* You shouldn't need a book on functional programming to use Redux.
* Everything (Stores, Action Creators, configuration) is hot reloadable.
* Preserves the benefits of Flux, but adds other nice properties thanks to its functional nature.
* Prevents some of the anti-patterns common in Flux code.
* Works great in [universal (aka “isomorphic”)](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) apps because it doesn't use singletons and the data can be rehydrated.
* Doesn't care how you store your data: you may use JS objects, arrays, ImmutableJS, etc.
* Under the hood, it keeps all your data in a tree, but you don't need to think about it.
* Lets you efficiently subscribe to finer-grained updates than individual Stores.
* Provides hooks for powerful devtools (e.g. time travel, record/replay) to be implementable without user buy-in.
* Provides extension points so it's easy to [support promises](https://github.com/gaearon/redux/issues/99#issuecomment-112212639) or [generate constants](https://gist.github.com/skevy/8a4ffc3cfdaf5fd68739) outside the core.
* No wrapper calls in your stores and actions. Your stuff is your stuff.
* It's super easy to test things in isolation without mocks.
* You can use “flat” Stores, or [compose and reuse Stores](https://gist.github.com/gaearon/d77ca812015c0356654f) just like you compose Components.
* The API surface area is minimal.
* Have I mentioned hot reloading yet?
