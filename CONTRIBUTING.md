# Contributing
We are always grateful for any contributions made by the community.  By contributing to Redux, you agree to abide by the [code of conduct]().

## Getting Started

First, visit the [Issues page]() to find out what open issues need to be addressed.

Fork, then clone the repo:
```
git clone https://github.com/your-username/redux.git
```

### Building The Documentation
##### Preparing to build the documentation
To install the latest version of `gitbooks` and prepare to build the documentation, run the following:
```
npm run docs:prepare
```
##### Building the documentation
To build the documentation, run the following:
```
npm run docs:build
```

To watch and re-build documentation when changes occur, run the following:
```
npm run docs:watch
```

##### Cleaning up built documentation
To remove previously built documentation, run the following:
```
npm run docs:clean
```

### Building and Testing Examples
Redux comes with official examples to demonstrate various concepts and practices. 

To build and test the official Redux examples, run the following:
```
npm run build:examples
npm run test:examples
```

## Submitting Changes