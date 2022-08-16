import { defineTest } from 'jscodeshift/src/testUtils'

describe('replace object syntax for declaring case reducers with builder', () => {
  defineTest(
    __dirname,
    `./createSliceBuilder`,
    null,
    `create-slice-builder/basic`,
    { parser: 'ts' }
  )
  defineTest(
    __dirname,
    `./createSliceBuilder`,
    null,
    `create-slice-builder/chained`,
    { parser: 'ts' }
  )
})
