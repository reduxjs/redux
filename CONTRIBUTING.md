# Contributing
We are open to, and grateful for, any contributions made by the community.  By contributing to Redux, you agree to abide by the [code of conduct](https://github.com/rackt/redux/blob/master/CODE_OF_CONDUCT.md).

## Reporting Issues and Asking Questions
Before opening an issue, please search the [issue tracker](https://github.com/rackt/redux/issues) to make sure your issue hasn't already been reported.

Please ask any general and implementation specific questions on [Stack Overflow with a Redux tag](http://stackoverflow.com/questions/tagged/redux?sort=votes&pageSize=50) for support.

## Development

Visit the [Issue tracker](https://github.com/rackt/redux/issues) to find a list of open issues that need attention.

Fork, then clone the repo:
```
git clone https://github.com/your-username/redux.git
```

### Building

#### Build Redux
To build Redux:
```
npm run build
```

To build the lib:
```
npm run build:lib
```

For a UMD build:
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
#### Preparing to build the documentation
To install the latest version of `gitbooks` and prepare to build the documentation, run the following:
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
Redux comes with [official examples](http://rackt.github.io/redux/docs/introduction/Examples.html) to demonstrate various concepts and best practices.

When adding a new example, please adhere to the style and format of the existing examples, and try to reuse as much code as possible.  For example, `index.html`, `server.js`, and `webpack.config.js` can typically be reused.

#### Building and testing the examples
To build and test the official Redux examples, run the following:
```
npm run build:examples
npm run test:examples
```

Please visit the [Examples page](http://rackt.github.io/redux/docs/introduction/Examples.html) for information on running an individual example.

## Submitting Changes
* Open a new issue in the [Issue tracker](https://github.com/rackt/redux/issues).
* Fork the repo.
* Create a new feature branch based off the `master` branch.
* Make sure all tests pass and there are no linting errors.
* Submit a pull request, referencing any issues it addresses.