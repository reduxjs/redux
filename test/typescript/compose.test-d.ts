import { compose } from 'redux'

describe('type tests', () => {
  // adapted from DefinitelyTyped/compose-function

  const numberToNumber = (a: number): number => a + 2

  const numberToString = (a: number): string => 'foo'

  const stringToNumber = (a: string): number => 5

  test('compose', () => {
    expectTypeOf(compose(numberToNumber, numberToNumber)(5)).toBeNumber()

    expectTypeOf(compose(numberToString, numberToNumber)(5)).toBeString()

    expectTypeOf(compose(numberToString, stringToNumber)('f')).toBeString()

    expectTypeOf(
      compose(
        (f: (a: string) => number) => (p: string) => 5,
        (f: (a: number) => string) => (p: string) => 4
      )(numberToString)
    ).toMatchTypeOf<(a: string) => number>()

    expectTypeOf(
      compose(stringToNumber, numberToString, numberToNumber)(5)
    ).toBeNumber()

    expectTypeOf(
      compose(numberToString, stringToNumber, numberToString, numberToNumber)(5)
    ).toBeString()

    // rest signature
    expectTypeOf(
      compose<string>(
        numberToString,
        numberToNumber,
        stringToNumber,
        numberToString,
        stringToNumber
      )('fo')
    ).toBeString()

    const multiArgFn = (a: string, b: number, c: boolean): string => 'foo'

    expectTypeOf(compose(multiArgFn)('bar', 42, true)).toBeString()

    expectTypeOf(
      compose(stringToNumber, multiArgFn)('bar', 42, true)
    ).toBeNumber()

    expectTypeOf(
      compose(numberToString, stringToNumber, multiArgFn)('bar', 42, true)
    ).toBeString()

    expectTypeOf(
      compose(
        stringToNumber,
        numberToString,
        stringToNumber,
        multiArgFn
      )('bar', 42, true)
    ).toBeNumber()

    const funcs = [stringToNumber, numberToString, stringToNumber]

    expectTypeOf(compose(...funcs)).toBeCallableWith('bar')
  })
})
