import { defineTest } from 'jscodeshift/src/testUtils'

describe('replace object syntax for declaring case reducers with builder', () => {
  defineTest(
    __dirname,
    `./createReducerBuilder`,
    null,
    `create-reducer-builder/basic`,
    { parser: 'ts' }
  )
  defineTest(
    __dirname,
    `./createReducerBuilder`,
    null,
    `create-reducer-builder/chained`,
    { parser: 'ts' }
  )
})
