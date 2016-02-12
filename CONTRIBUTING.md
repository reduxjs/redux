# Contributing
We are open to, and grateful for, any contributions made by the community.  By contributing to Redux, you agree to abide by the [code of conduct](https://github.com/reactjs/redux/blob/master/CODE_OF_CONDUCT.md).

## Reporting Issues and Asking Questions
Before opening an issue, please search the [issue tracker](https://github.com/reactjs/redux/issues) to make sure your issue hasn't already been reported.

Please ask any general and implementation specific questions on [Stack Overflow with a Redux tag](http://stackoverflow.com/questions/tagged/redux?sort=votes&pageSize=50) for support.

## Development

Visit the [Issue tracker](https://github.com/reactjs/redux/issues) to find a list of open issues that need attention.

Fork, then clone the repo:
```
git clone https://github.com/your-username/redux.git
```

### Building

#### Build Redux

Running the `build` task will create both a CommonJS module-per-module build and a UMD build.
```
npm run build
```

To create just a CommonJS module-per-module build:
```
npm run build:lib
```

To create just a UMD build:
```
npm run build:umd
npm run build:umd:min
```

### Testing and Linting
To run both linting and testing at once, run the following:
```
npm run check
```

To only run tests:
```
npm run test
```

To continuously watch and run tests, run the following:
```
npm run test:watch
```

To perform linting with `eslint`, run the following:
```
npm run lint
```

### Docs

Improvements to the documentation are always welcome. In the docs we abide by typographic rules, so
instead of ' you should use ’, same for “ ” and dashes (—) where appropriate. These rules only apply to the text, not to code blocks.

#### Preparing to build the documentation
To install the latest version of `gitbook` and prepare to build the documentation, run the following:
```
npm run docs:prepare
```
#### Building the documentation
To build the documentation, run the following:
```
npm run docs:build
```

To watch and re-build documentation when changes occur, run the following:
```
npm run docs:watch
```

#### Publishing the documentation
To publish the documentation, run the following:
```
npm run docs:publish
```

#### Cleaning up built documentation
To remove previously built documentation, run the following:
```
npm run docs:clean
```

### Examples
Redux comes with [official examples](http://redux.js.org/docs/introduction/Examples.html) to demonstrate various concepts and best practices.

When adding a new example, please adhere to the style and format of the existing examples, and try to reuse as much code as possible.  For example, `index.html`, `server.js`, and `webpack.config.js` can typically be reused.

>For ease of development, the webpack configs for the examples are set up so that the `redux` module is aliased to the project `src` folder when inside of the Redux folder. If an example is moved out of the Redux folder, they will instead use the version of Redux from `node_modules`.

#### Building and testing the examples
To build and test the official Redux examples, run the following:
```
npm run build:examples
npm run test:examples
```

Please visit the [Examples page](http://redux.js.org/docs/introduction/Examples.html) for information on running an individual example.

###New Features
Please open an issue with a proposal for a new feature or refactoring before starting on the work. We don't want you to waste your efforts on a pull request that we won't want to accept.

###Style
The [reactjs](https://github.com/reactjs) GitHub org is trying to keep a standard style across its various projects, which can be found over in [eslint-config-reactjs](https://github.com/reactjs/eslint-config-reactjs). If you have a style change proposal, it should first be proposed there. If accepted, we will be happy to accept a PR to implement it here.

## Submitting Changes
* Open a new issue in the [Issue tracker](https://github.com/reactjs/redux/issues).
* Fork the repo.
* Create a new feature branch based off the `master` branch.
* Make sure all tests pass and there are no linting errors.
* Submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including unrelated commits.

After you have submitted your pull request, we'll try to get back to you as soon as possible. We may suggest some changes or improvements.

Thank you for contributing!
