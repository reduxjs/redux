Core Ideas
----------

Three Fundamental Principles of Redux:

1. **Single store (single source of truth).**
    - Facilitates universal (isomorphic) apps. State can be serialized on the server and rehydrated on the client without much extra code.
    - Encourages a faster development cycle. State can be persisted during development, so you don't need to manually get back to the previous state every time you refresh.
    - Free undo/redo. Since there is a single state tree, undo/redo is essentially built-in.

2. **Actions initiate mutation of state.**
    - *Action*: An object that describes *what happened* (i.e., success or failure of a function call).
    - Views and callbacks never mutate state themselves, they may only express intent to mutate.
    - Centralized mutations that happen strictly in order preclude race conditions.
    - Actions are plain objects; they can be serialized and logged, or stored for later replay, debugging, and testing.

3. **Reducers mutate the state.**
    - *Reducer*: A pure function that takes the previous state and action as arguments and returns the next state.
    - Multiple reducers can manage separate branches of the state tree.
    - You can control the order of reducer function calls, pass additional data, or make reusable reducers for common tasks like pagination.

--------------------------

Next: [Getting Started](Getting Started.md)
