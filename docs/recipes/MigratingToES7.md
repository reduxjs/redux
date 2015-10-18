# Migrating to ES7

If you like ES7 syntactic sugar you can use it with Redux!

## mapStateToProps() -> @connect

Example based on "Todo List" app

**ES6**:

```js
class App extends Component {
...
}

function mapStateToProps(state) {
  return {
    visibleTodos: selectTodos(state.todos, state.visibilityFilter),
    visibilityFilter: state.visibilityFilter
  };
}

export default connect(select)(App);

```

**ES7**:

```js
@connect(state => ({
    visibleTodos: selectTodos(state.todos, state.visibilityFilter),
    visibilityFilter: state.visibilityFilter
}))
export default class App extends Component {
...
}

```

## component propTypes -> static

Example based on "Todo List" app

**ES6**:
```js
class App extends Component {
...
}

App.propTypes = {
  visibleTodos: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired
  })),
  visibilityFilter: PropTypes.oneOf([
    'SHOW_ALL',
    'SHOW_COMPLETED',
    'SHOW_ACTIVE'
  ]).isRequired
};

```

**ES7**:
```js
class App extends Component {
    static propTypes = {
      visibleTodos: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired
      })),
      visibilityFilter: PropTypes.oneOf([
        'SHOW_ALL',
        'SHOW_COMPLETED',
        'SHOW_ACTIVE'
      ]).isRequired
    };
    ...
}

```