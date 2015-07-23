Core Ideas
--------------------------

Redux can be described in three fundamental principles:

* **The whole state of your app is stored in an object tree inside a single *store*.** This makes it easy to create universal apps. The state from the server can be serialized and hydrated into the client with no extra coding effort. You can also persist your app’s state in development for a faster development cycle. And of course, with a single state tree, you get the previously difficult functionality like Undo/Redo for free.

* **The only way to mutate the state is to emit an *action*, an object describing what happened.** This ensures that the views or the network callbacks never write directly to the state, and instead express the intent to mutate. Because all mutations are centralized and happen one by one in a strict order, there are no subtle race conditions to watch out for. Actions are just plain objects, so they can be logged, serialized, stored, and later replayed for debugging or testing purposes.

* **To specify how the state tree is transformed by the actions, you write pure *reducers*.** Reducers are just pure functions that take the previous state and the action, and return the next state. You can start with a single reducer, but as your app grows, you can split it into smaller reducers that manage the specific parts of the state tree. Because reducers are just functions, you can control the order in which they are called, pass additional data, or even make reusable reducers for common tasks such as pagination.
