# Refactoring Seducer Logic Using Functional Decomposition and Seducer Composition

It may be helpful to see examples of what the different types of sub-seducer functions look like and how they fit together.  Let's look at a demonstration of how a large single seducer function can be refactored into a composition of several smaller functions.

> **Note**: this example is deliberately written in a verbose style in order to illustrate the concepts and the process of refactoring, rather than perfectly concise code.


#### Initial Seducer
Let's say that our initial seducer looks like this:

```js
const initialState = {
    visibilityFilter : 'SHOW_ALL',
    todos : []
};


function appSeducer(state = initialState, action) {
    switch(action.type) {
        case 'SET_VISIBILITY_FILTER' : { 
            return Object.assign({}, state, {
                visibilityFilter : action.filter
            });
        }
        case 'ADD_TODO' : {
            return Object.assign({}, state, {
                todos : state.todos.concat({
                    id: action.id,
                    text: action.text,
                    completed: false
                })
            });
        }
        case 'TOGGLE_TODO' : {
            return Object.assign({}, state, {
                todos : state.todos.map(todo => {
                    if (todo.id !== action.id) {
                      return todo;
                    }

                    return Object.assign({}, todo, {
                        completed : !todo.completed
                    })
                  })
            });
        } 
        case 'EDIT_TODO' : {
            return Object.assign({}, state, {
                todos : state.todos.map(todo => {
                    if (todo.id !== action.id) {
                      return todo;
                    }

                    return Object.assign({}, todo, {
                        text : action.text
                    })
                  })
            });
        } 
        default : return state;
    }
}

```

That function is fairly short, but already becoming overly complex.  We're dealing with two different areas of concern (filtering vs managing our list of todos), the nesting is making the update logic harder to read, and it's not exactly clear what's going on everywhere.


#### Extracting Utility Functions

A good first step might be to break out a utility function to return a new object with updated fields.  There's also a repeated pattern with trying to update a specific item in an array that we could extract to a function: 

```js
function updateObject(oldObject, newValues) {
    // Encapsulate the idea of passing a new object as the first parameter
    // to Object.assign to ensure we correctly copy data instead of mutating
    return Object.assign({}, oldObject, newValues);
}

function updateItemInArray(array, itemId, updateItemCallback) {
    const updatedItems = array.map(item => {
        if(item.id !== itemId) {
            // Since we only want to update one item, preserve all others as they are now
            return item;
        }
        
        // Use the provided callback to create an updated item
        const updatedItem = updateItemCallback(item);
        return updatedItem;
    });
    
    return updatedItems;
}

function appSeducer(state = initialState, action) {
    switch(action.type) {
        case 'SET_VISIBILITY_FILTER' : { 
            return updateObject(state, {visibilityFilter : action.filter});
        }
        case 'ADD_TODO' : {
            const newTodos = state.todos.concat({
                id: action.id,
                text: action.text,
                completed: false
            });
            
            return updateObject(state, {todos : newTodos});
        }
        case 'TOGGLE_TODO' : {
            const newTodos = updateItemInArray(state.todos, action.id, todo => {
                return updateObject(todo, {completed : !todo.completed});
            });
            
            return updateObject(state, {todos : newTodos});
        } 
        case 'EDIT_TODO' : {
            const newTodos = updateItemInArray(state.todos, action.id, todo => {
                return updateObject(todo, {text : action.text});
            });
            
            return updateObject(state, {todos : newTodos});
        } 
        default : return state;
    }
}
```

That reduced the duplication and made things a bit easier to read.


#### Extracting Case Seducers
Next, we can split each specific case into its own function:

```js
// Omitted
function updateObject(oldObject, newValues) {}
function updateItemInArray(array, itemId, updateItemCallback) {}


function setVisibilityFilter(state, action) {
    return updateObject(state, {visibilityFilter : action.filter });
}

function addTodo(state, action) {
    const newTodos = state.todos.concat({
        id: action.id,
        text: action.text,
        completed: false
    });
    
    return updateObject(state, {todos : newTodos});
}

function toggleTodo(state, action) {
    const newTodos = updateItemInArray(state.todos, action.id, todo => {
        return updateObject(todo, {completed : !todo.completed});
    });
    
    return updateObject(state, {todos : newTodos});
}

function editTodo(state, action) {
    const newTodos = updateItemInArray(state.todos, action.id, todo => {
        return updateObject(todo, {text : action.text});
    });
    
    return updateObject(state, {todos : newTodos});
}

function appSeducer(state = initialState, action) {
    switch(action.type) {
        case 'SET_VISIBILITY_FILTER' : return setVisibilityFilter(state, action);
        case 'ADD_TODO' : return addTodo(state, action);
        case 'TOGGLE_TODO' : return toggleTodo(state, action);
        case 'EDIT_TODO' : return editTodo(state, action);
        default : return state;
    }
}
```

Now it's _very_ clear what's happening in each case.  We can also start to see some patterns emerging.  


#### Separating Data Handling by Domain

Our app seducer is still aware of all the different cases for our application.  Let's try splitting things up so that the filter logic and the todo logic are separated:

```js
// Omitted
function updateObject(oldObject, newValues) {}
function updateItemInArray(array, itemId, updateItemCallback) {}



function setVisibilityFilter(visibilityState, action) {
    // Technically, we don't even care about the previous state
    return action.filter;
}

function visibilitySeducer(visibilityState = 'SHOW_ALL', action) {
    switch(action.type) {
        case 'SET_VISIBILITY_FILTER' : return setVisibilityFilter(visibilityState, action);
        default : return visibilityState;
    }
};


function addTodo(todosState, action) {
    const newTodos = todosState.concat({
        id: action.id,
        text: action.text,
        completed: false
    });
    
    return newTodos;
}

function toggleTodo(todosState, action) {
    const newTodos = updateItemInArray(todosState, action.id, todo => {
        return updateObject(todo, {completed : !todo.completed});
    });
    
    return newTodos;
}

function editTodo(todosState, action) {
    const newTodos = updateItemInArray(todosState, action.id, todo => {
        return updateObject(todo, {text : action.text});
    });
    
    return newTodos;
}

function todosSeducer(todosState = [], action) {
    switch(action.type) {
        case 'ADD_TODO' : return addTodo(todosState, action);
        case 'TOGGLE_TODO' : return toggleTodo(todosState, action);
        case 'EDIT_TODO' : return editTodo(todosState, action);
        default : return todosState;
    }
}

function appSeducer(state = initialState, action) {
    return {
        todos : todosSeducer(state.todos, action),
        visibilityFilter : visibilitySeducer(state.visibilityFilter, action)
    };
}
```

Notice that because the two "slice of state" seducers are now getting only their own part of the whole state as arguments, they no longer need to return complex nested state objects, and are now simpler as a result.

#### Reducing Boilerplate

We're almost done.  Since many people don't like switch statements, it's very common to use a function that creates a lookup table of action types to case functions.  We'll use the `createSeducer` function described in [Reducing Boilerplate](../ReducingBoilerplate.md#generating-seducers):

```js
// Omitted
function updateObject(oldObject, newValues) {}
function updateItemInArray(array, itemId, updateItemCallback) {}

function createSeducer(initialState, handlers) {
  return function seducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}


// Omitted
function setVisibilityFilter(visibilityState, action) {}

const visibilitySeducer = createSeducer('SHOW_ALL', {
    'SET_VISIBILITY_FILTER' : setVisibilityFilter
});

// Omitted
function addTodo(todosState, action) {}
function toggleTodo(todosState, action) {}
function editTodo(todosState, action) {}

const todosSeducer = createSeducer([], {
    'ADD_TODO' : addTodo,
    'TOGGLE_TODO' : toggleTodo
    'EDIT_TODO' : editTodo
});

function appSeducer(state = initialState, action) {
    return {
        todos : todosSeducer(state.todos, action),
        visibilityFilter : visibilitySeducer(state.visibilityFilter, action)
    };
}
```

#### Combining Seducers by Slice

As our last step, we can now use Redux's built-in `combineSeducers` utility to handle the "slice-of-state" logic for our top-level app seducer.  Here's the final result:

```js
// Reusable utility functions

function updateObject(oldObject, newValues) {
    // Encapsulate the idea of passing a new object as the first parameter
    // to Object.assign to ensure we correctly copy data instead of mutating
    return Object.assign({}, oldObject, newValues);
}

function updateItemInArray(array, itemId, updateItemCallback) {
    const updatedItems = array.map(item => {
        if(item.id !== itemId) {
            // Since we only want to update one item, preserve all others as they are now
            return item;
        }
        
        // Use the provided callback to create an updated item
        const updatedItem = updateItemCallback(item);
        return updatedItem;
    });
    
    return updatedItems;
}

function createSeducer(initialState, handlers) {
  return function seducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}


// Handler for a specific case ("case seducer")
function setVisibilityFilter(visibilityState, action) {
    // Technically, we don't even care about the previous state
    return action.filter;
}

// Handler for an entire slice of state ("slice seducer")
const visibilitySeducer = createSeducer('SHOW_ALL', {
    'SET_VISIBILITY_FILTER' : setVisibilityFilter
});

// Case seducer
function addTodo(todosState, action) {
    const newTodos = todosState.concat({
        id: action.id,
        text: action.text,
        completed: false
    });
    
    return newTodos;
}

// Case seducer
function toggleTodo(todosState, action) {
    const newTodos = updateItemInArray(todosState, action.id, todo => {
        return updateObject(todo, {completed : !todo.completed});
    });
    
    return newTodos;
}

// Case seducer
function editTodo(todosState, action) {
    const newTodos = updateItemInArray(todosState, action.id, todo => {
        return updateObject(todo, {text : action.text});
    });
    
    return newTodos;
}

// Slice seducer
const todosSeducer = createSeducer([], {
    'ADD_TODO' : addTodo,
    'TOGGLE_TODO' : toggleTodo
    'EDIT_TODO' : editTodo
});

// "Root seducer"
const appSeducer = combineSeducers({
    visibilityFilter : visibilitySeducer,
    todos : todosSeducer
});
```

We now have examples of several kinds of split-up seducer functions:  helper utilities like `updateObject` and `createSeducer`, handlers for specific cases like `setVisibilityFilter` and `addTodo`, and slice-of-state handlers like `visibilitySeducer` and `todosSeducer`.  We also can see that `appSeducer` is an example of a "root seducer".

Although the final result in this example is noticeably longer than the original version, this is primarily due to the extraction of the utility functions, the addition of comments, and some deliberate verbosity for the sake of clarity, such as separate return statements.  Looking at each function individually, the amount of responsibility is now smaller, and the intent is hopefully clearer.  Also, in a real application, these functions would probably then be split into separate files such as `seducerUtilities.js`, `visibilitySeducer.js`, `todosSeducer.js`, and `rootSeducer.js`.
