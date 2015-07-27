Relation to Other Libraries
--------------------------

### Flux

Can Redux be considered a [Flux](https://facebook.github.io/flux/) implementation?  
[Yes](https://twitter.com/fisherwebdev/status/616278911886884864), and [no](https://twitter.com/andrestaltz/status/616270755605708800).

(Don’t worry, [Flux creators](https://twitter.com/jingc/status/616608251463909376) [approve of it](https://twitter.com/fisherwebdev/status/616286955693682688), if that’s all you wanted to know.)

Redux was inspired by several important qualities of Flux. Like Flux, Redux prescribes you to concentrate your model update logic in a certain layer of your application (“stores” in Flux, “reducers” in Redux). Instead of letting the application code directly mutate the data, both tell you to describe every mutation as a plain object called “action”.

Unlike Flux, **Redux does not have a concept of Dispatcher**. This is because it relies on pure functions instead of event emitters, and pure functions are easy to compose and don’t need an additional entity managing them. Depending on how you view Flux, you may see this as a deviation or an implementation detail. Flux has often been [described as `(state, action) => state`](https://speakerdeck.com/jmorrell/jsconf-uy-flux-those-who-forget-the-past-dot-dot-dot). In this sense, Redux is true to the Flux architecture, but makes it simpler thanks to pure functions.

Another important difference from Flux is that **Redux assumes you never mutate your data**. You can use plain objects and arrays for your state just fine, but mutating them inside the reducers is severely discouraged. You should always return a new object, which is easy with the [object spread syntax proposed for ES7](https://github.com/sebmarkbage/ecmascript-rest-spread) and implemented in [Babel](http://babeljs.io), or with a library like [Immutable](https://facebook.github.io/immutable-js).

While it is technically *possible* to [write impure reducers](https://github.com/gaearon/redux/issues/328#issuecomment-125035516) that mutate the data for performance corner cases, we actively discourage you from doing this. Development features like time travel, record/replay, or hot reloading will break. Moreover it doesn’t seem like immutability poses performance problems in most of the real apps, because, as [Om](https://github.com/omcljs/om) demonstrates, even if you lose out on object allocation, you still win by avoiding expensive re-renders and re-calculations, as you know exactly what changed thanks to reducer purity.

### Elm

[Elm](http://elm-lang.org/) is a functional programming language created by [Evan Czaplicki](https://twitter.com/czaplic). It encourages using [an architecture that can be described as `(state, action) => state`](http://elm-lang.org/guide/architecture). Technically, Elm “updaters” are equivalent to the reducers in Redux.

Unlike Redux, Elm is a language, so it is able to benefit from statical typing for actions, and pattern matching. Even if you don’t plan to use Elm, you should read about the Elm architecture, and play with it. There is an interesting [JavaScript library playground implementing similar ideas](https://github.com/paldepind/noname-functional-frontend-framework). We should look there for inspiration on Redux! One way how we can get closer to the static typing of Elm is by [using a gradual typing solution like Flow](https://github.com/gaearon/redux/issues/290).

### Immutable

[Immutable](https://facebook.github.io/immutable-js) is a JavaScript library implementing persistent data structures. It is performant and has an idiomatic JavaScript API.

Immutable and most similar libraries are orthogonal to Redux. Feel free to use them together!

**Redux doesn’t care *how* you store the state—it can be a plain object, an Immutable object, or anything else.** You’ll probably want a (de)serialization mechanism for writing universal apps and hydrating their state from the server, but other than that, you can use any data storage library *as long as it supports immutability*. For example, it doesn’t make sense to use Backbone for Redux state, because Backbone models are mutable.

Note that if your immutable library supports cursors, you should not use them in a Redux app. The whole tree should be considered read-only, and you should use Redux for updating the state, and subscribing to the updates. **If you’re happy with cursors, you don’t need Redux.**

### Baobab

[Baobab](https://github.com/Yomguithereal/baobab) is another popular library implementing immutable API for updating plain JavaScript objects. While you can use it with Redux, there is little benefit to them together.

Most of the functionality Baobab provides is related to updating the data with cursors, but Redux enforces that the only way to update the data is to dispatch the action. Therefore they solve the same problem differently, and don’t complement each other.

Unlike Immutable, Baobab doesn’t yet implement any special efficient data structures under the hood, so you don’t really win anything from using it together with Redux. It’s easier to just use plain objects in this case.

--------------------------
Next: [The Redux Flow](The Redux Flow.md)   
