// Source: https://github.com/ethossoftworks/outcome-ts

const outcomeSymbol = Symbol()

export class Ok<T> {
  private outcomeSymbol = outcomeSymbol

  constructor(public value: T) {}

  isError(): this is Error<T> {
    return false
  }

  isOk(): this is Ok<T> {
    return true
  }
}

export class Error<E = unknown> {
  private outcomeSymbol = outcomeSymbol

  constructor(public error: E) {}

  isError(): this is Error {
    return true
  }

  isOk(): this is Ok<any> {
    return false
  }
}

export const Outcome = {
  ok: <T>(value: T) => new Ok(value),
  error: <E>(error: E) => new Error(error),

  wrap: async <T>(promise: Promise<T>): Promise<Outcome<T>> => {
    try {
      return new Ok(await promise)
    } catch (e) {
      return new Error(e)
    }
  },

  try: async <T>(block: () => Promise<T>): Promise<Outcome<T>> => {
    try {
      return new Ok(await block())
    } catch (e) {
      return new Error(e)
    }
  },

  isOutcome: (other: any): other is Outcome<any> => {
    return other !== undefined && other.outcomeSymbol === outcomeSymbol
  },
}

export type Outcome<T, E = unknown> = Ok<T> | Error<E>
