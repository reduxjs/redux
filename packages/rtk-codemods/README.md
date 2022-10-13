# RTK Codemods

A collection of codemods for updating legacy Redux Toolkit API usage patterns to modern patterns.

## Usage

To run a specific codemod from this project, you would run the following:

```bash
npx @reduxjs/rtk-codemods <TRANSFORM NAME> path/of/files/ or/some**/*glob.js

# or

yarn global add @reduxjs/rtk-codemods
rtk-codemods <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
```

## Local Usage

```
node ./bin/cli.js <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
```

## Transforms

<!--TRANSFORMS_START-->

- [createReducerBuilder](transforms/createReducerBuilder/README.md)
- [createSliceBuilder](transforms/createSliceBuilder/README.md)
<!--TRANSFORMS_END-->

## Contributing

### Installation

- clone the repo
- change into the repo directory
- `yarn`

### Running tests

- `yarn test`

### Update Documentation

- `yarn update-docs`
