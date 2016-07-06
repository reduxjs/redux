# Structuring Reducers

At its core, Redux is really a fairly simple design pattern: all your "write" logic goes into a single function, and the only way to run that logic is to give Redux a plain object that describes something that has happened.  The Redux store calls that write logic function and passes in the current state tree and the descriptive object, the write logic function returns some new state tree, and the Redux store notifies any subscribers that the state tree has changed.  

Redux puts some basic constraints on how that write logic function should work.  As described in [Reducers](../basics/Reducers.md), this write logic function:

- Should have a signature of `(previousState, action) => newState`.  Because this is the effectively the same type of function you would pass to [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce), we refer to this "write logic function" as a **"reducer"**.
- Should be "pure", which means it does not mutate its arguments, perform side effects like API calls or modifying values outside of the function, or call non-pure functions like `Date.now()` or `Math.random()`.  This also means that updates should be done in an ***"immutable"*** fashion, which means **always returning new objects with the updated data**, rather than directly modifying the original state tree in-place.

>##### Note on immutability, side effects, and mutation
> Mutation is discouraged because it generally breaks time-travel debugging, and React Redux's `connect` function.  For time traveling, the Redux DevTools expect that replaying recorded actions would output a state value, but not change anything else.  For React Redux, `connect` checks to see if the values returned from a `mapStateToProps` function have changed in order to see if a component needs to update.  Direct mutation can cause both of these scenarios to not work correctly.  Other side effects like generating unique IDs or timestamps also make the code unpredictable and harder to debug.  

Beyond that, Redux does not really care how you actually structure your reducer logic as long as it obeys those basic rules.  This is both a source of freedom and a source of confusion.  However, there are a number of common patterns that are widely used when writing reducers, as well as a number of related topics and concepts to be aware of.  As an application increases in complexity, these patterns play a crucial role in managing reducer code complexity, handling real-world data, and optimizing UI performance.  This section describes many of those patterns and concepts.




Topics: 

- [Prerequisite Concepts](./reducers/00-PrerequisiteConcepts.md)
- [Basic Reducer Structure](./reducers/01-BasicReducerStructure.md)
- [Splitting Reducer Logic](./reducers/02-SplittingReducerLogic.md)
- [Refactoring Reducers Example](./reducers/03-RefactoringReducersExample.md)
- [Using `combineReducers](./reducers/04-UsingCombineReducers.md)
- [Beyond `combineReducers`](./reducers/05-BeyondCombineReducers.md)
- [Normalizing State Shape](./reducers/06-NormalizingStateShape.md)
- [Updating Normalized Data](./reducers/07-UpdatingNormalizedData.md)