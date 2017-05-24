// flow-typed signature: 032214c577f085159829eeae40c41e6a
// flow-typed version: 7dc2a8971e/jest_v18.x.x/flow_>=v0.33.x

type JestMockFn = {
  (...args: Array<any>): any,
  /**
   * An object for introspecting mock calls
   */
  mock: {
    /**
     * An array that represents all calls that have been made into this mock
     * function. Each call is represented by an array of arguments that were
     * passed during the call.
     */
    calls: Array<Array<any>>,
    /**
     * An array that contains all the object instances that have been
     * instantiated from this mock function.
     */
    instances: mixed,
  },
  /**
   * Resets all information stored in the mockFn.mock.calls and
   * mockFn.mock.instances arrays. Often this is useful when you want to clean
   * up a mock's usage data between two assertions.
   */
  mockClear(): Function,
  /**
   * Resets all information stored in the mock. This is useful when you want to
   * completely restore a mock back to its initial state.
   */
  mockReset(): Function,
  /**
   * Accepts a function that should be used as the implementation of the mock.
   * The mock itself will still record all calls that go into and instances
   * that come from itself -- the only difference is that the implementation
   * will also be executed when the mock is called.
   */
  mockImplementation(fn: Function): JestMockFn,
  /**
   * Accepts a function that will be used as an implementation of the mock for
   * one call to the mocked function. Can be chained so that multiple function
   * calls produce different results.
   */
  mockImplementationOnce(fn: Function): JestMockFn,
  /**
   * Just a simple sugar function for returning `this`
   */
  mockReturnThis(): void,
  /**
   * Deprecated: use jest.fn(() => value) instead
   */
  mockReturnValue(value: any): JestMockFn,
  /**
   * Sugar for only returning a value once inside your mock
   */
  mockReturnValueOnce(value: any): JestMockFn,
}

type JestAsymmetricEqualityType = {
  /**
   * A custom Jasmine equality tester
   */
  asymmetricMatch(value: mixed): boolean,
}

type JestCallsType = {
  allArgs(): mixed,
  all(): mixed,
  any(): boolean,
  count(): number,
  first(): mixed,
  mostRecent(): mixed,
  reset(): void,
}

type JestClockType = {
  install(): void,
  mockDate(date: Date): void,
  tick(): void,
  uninstall(): void,
}

type JestMatcherResult = {
  message?: string | ()=>string,
  pass: boolean,
}

type JestMatcher = (actual: any, expected: any) => JestMatcherResult;

type JestExpectType = {
  not: JestExpectType,
  /**
   * If you have a mock function, you can use .lastCalledWith to test what
   * arguments it was last called with.
   */
  lastCalledWith(...args: Array<any>): void,
  /**
   * toBe just checks that a value is what you expect. It uses === to check
   * strict equality.
   */
  toBe(value: any): void,
  /**
   * Use .toHaveBeenCalled to ensure that a mock function got called.
   */
  toBeCalled(): void,
  /**
   * Use .toBeCalledWith to ensure that a mock function was called with
   * specific arguments.
   */
  toBeCalledWith(...args: Array<any>): void,
  /**
   * Using exact equality with floating point numbers is a bad idea. Rounding
   * means that intuitive things fail.
   */
  toBeCloseTo(num: number, delta: any): void,
  /**
   * Use .toBeDefined to check that a variable is not undefined.
   */
  toBeDefined(): void,
  /**
   * Use .toBeFalsy when you don't care what a value is, you just want to
   * ensure a value is false in a boolean context.
   */
  toBeFalsy(): void,
  /**
   * To compare floating point numbers, you can use toBeGreaterThan.
   */
  toBeGreaterThan(number: number): void,
  /**
   * To compare floating point numbers, you can use toBeGreaterThanOrEqual.
   */
  toBeGreaterThanOrEqual(number: number): void,
  /**
   * To compare floating point numbers, you can use toBeLessThan.
   */
  toBeLessThan(number: number): void,
  /**
   * To compare floating point numbers, you can use toBeLessThanOrEqual.
   */
  toBeLessThanOrEqual(number: number): void,
  /**
   * Use .toBeInstanceOf(Class) to check that an object is an instance of a
   * class.
   */
  toBeInstanceOf(cls: Class<*>): void,
  /**
   * .toBeNull() is the same as .toBe(null) but the error messages are a bit
   * nicer.
   */
  toBeNull(): void,
  /**
   * Use .toBeTruthy when you don't care what a value is, you just want to
   * ensure a value is true in a boolean context.
   */
  toBeTruthy(): void,
  /**
   * Use .toBeUndefined to check that a variable is undefined.
   */
  toBeUndefined(): void,
  /**
   * Use .toContain when you want to check that an item is in a list. For
   * testing the items in the list, this uses ===, a strict equality check.
   */
  toContain(item: any): void,
  /**
   * Use .toContainEqual when you want to check that an item is in a list. For
   * testing the items in the list, this matcher recursively checks the
   * equality of all fields, rather than checking for object identity.
   */
  toContainEqual(item: any): void,
  /**
   * Use .toEqual when you want to check that two objects have the same value.
   * This matcher recursively checks the equality of all fields, rather than
   * checking for object identity.
   */
  toEqual(value: any): void,
  /**
   * Use .toHaveBeenCalled to ensure that a mock function got called.
   */
  toHaveBeenCalled(): void,
  /**
   * Use .toHaveBeenCalledTimes to ensure that a mock function got called exact
   * number of times.
   */
  toHaveBeenCalledTimes(number: number): void,
  /**
   * Use .toHaveBeenCalledWith to ensure that a mock function was called with
   * specific arguments.
   */
  toHaveBeenCalledWith(...args: Array<any>): void,
  /**
   * Check that an object has a .length property and it is set to a certain
   * numeric value.
   */
  toHaveLength(number: number): void,
  /**
   *
   */
  toHaveProperty(propPath: string, value?: any): void,
  /**
   * Use .toMatch to check that a string matches a regular expression.
   */
  toMatch(regexp: RegExp): void,
  /**
   * Use .toMatchObject to check that a javascript object matches a subset of the properties of an object.
   */
  toMatchObject(object: Object): void,
  /**
   * This ensures that a React component matches the most recent snapshot.
   */
  toMatchSnapshot(name?: string): void,
  /**
   * Use .toThrow to test that a function throws when it is called.
   */
  toThrow(message?: string | Error): void,
  /**
   * Use .toThrowError to test that a function throws a specific error when it
   * is called. The argument can be a string for the error message, a class for
   * the error, or a regex that should match the error.
   */
  toThrowError(message?: string | Error | RegExp): void,
  /**
   * Use .toThrowErrorMatchingSnapshot to test that a function throws a error
   * matching the most recent snapshot when it is called.
   */
  toThrowErrorMatchingSnapshot(): void,
}

type JestObjectType = {
  /**
   *  Disables automatic mocking in the module loader.
   *
   *  After this method is called, all `require()`s will return the real
   *  versions of each module (rather than a mocked version).
   */
  disableAutomock(): JestObjectType,
  /**
   * An un-hoisted version of disableAutomock
   */
  autoMockOff(): JestObjectType,
  /**
   * Enables automatic mocking in the module loader.
   */
  enableAutomock(): JestObjectType,
  /**
   * An un-hoisted version of enableAutomock
   */
  autoMockOn(): JestObjectType,
  /**
   * Resets the state of all mocks. Equivalent to calling .mockReset() on every
   * mocked function.
   */
  resetAllMocks(): JestObjectType,
  /**
   * Removes any pending timers from the timer system.
   */
  clearAllTimers(): void,
  /**
   * The same as `mock` but not moved to the top of the expectation by
   * babel-jest.
   */
  doMock(moduleName: string, moduleFactory?: any): JestObjectType,
  /**
   * The same as `unmock` but not moved to the top of the expectation by
   * babel-jest.
   */
  dontMock(moduleName: string): JestObjectType,
  /**
   * Returns a new, unused mock function. Optionally takes a mock
   * implementation.
   */
  fn(implementation?: Function): JestMockFn,
  /**
   * Determines if the given function is a mocked function.
   */
  isMockFunction(fn: Function): boolean,
  /**
   * Given the name of a module, use the automatic mocking system to generate a
   * mocked version of the module for you.
   */
  genMockFromModule(moduleName: string): any,
  /**
   * Mocks a module with an auto-mocked version when it is being required.
   *
   * The second argument can be used to specify an explicit module factory that
   * is being run instead of using Jest's automocking feature.
   *
   * The third argument can be used to create virtual mocks -- mocks of modules
   * that don't exist anywhere in the system.
   */
  mock(moduleName: string, moduleFactory?: any): JestObjectType,
  /**
   * Resets the module registry - the cache of all required modules. This is
   * useful to isolate modules where local state might conflict between tests.
   */
  resetModules(): JestObjectType,
  /**
   * Exhausts the micro-task queue (usually interfaced in node via
   * process.nextTick).
   */
  runAllTicks(): void,
  /**
   * Exhausts the macro-task queue (i.e., all tasks queued by setTimeout(),
   * setInterval(), and setImmediate()).
   */
  runAllTimers(): void,
  /**
   * Exhausts all tasks queued by setImmediate().
   */
  runAllImmediates(): void,
  /**
   * Executes only the macro task queue (i.e. all tasks queued by setTimeout()
   * or setInterval() and setImmediate()).
   */
  runTimersToTime(msToRun: number): void,
  /**
   * Executes only the macro-tasks that are currently pending (i.e., only the
   * tasks that have been queued by setTimeout() or setInterval() up to this
   * point)
   */
  runOnlyPendingTimers(): void,
  /**
   * Explicitly supplies the mock object that the module system should return
   * for the specified module. Note: It is recommended to use jest.mock()
   * instead.
   */
  setMock(moduleName: string, moduleExports: any): JestObjectType,
  /**
   * Indicates that the module system should never return a mocked version of
   * the specified module from require() (e.g. that it should always return the
   * real module).
   */
  unmock(moduleName: string): JestObjectType,
  /**
   * Instructs Jest to use fake versions of the standard timer functions
   * (setTimeout, setInterval, clearTimeout, clearInterval, nextTick,
   * setImmediate and clearImmediate).
   */
  useFakeTimers(): JestObjectType,
  /**
   * Instructs Jest to use the real versions of the standard timer functions.
   */
  useRealTimers(): JestObjectType,
}

type JestSpyType = {
  calls: JestCallsType,
}

/** Runs this function after every test inside this context */
declare function afterEach(fn: Function): void;
/** Runs this function before every test inside this context */
declare function beforeEach(fn: Function): void;
/** Runs this function after all tests have finished inside this context */
declare function afterAll(fn: Function): void;
/** Runs this function before any tests have started inside this context */
declare function beforeAll(fn: Function): void;
/** A context for grouping tests together */
declare function describe(name: string, fn: Function): void;

/** An individual test unit */
declare var it: {
  /**
   * An individual test unit
   *
   * @param {string} Name of Test
   * @param {Function} Test
   */
  (name: string, fn?: Function): ?Promise<void>,
  /**
   * Only run this test
   *
   * @param {string} Name of Test
   * @param {Function} Test
   */
  only(name: string, fn?: Function): ?Promise<void>,
  /**
   * Skip running this test
   *
   * @param {string} Name of Test
   * @param {Function} Test
   */
  skip(name: string, fn?: Function): ?Promise<void>,
  /**
   * Run the test concurrently
   *
   * @param {string} Name of Test
   * @param {Function} Test
   */
  concurrent(name: string, fn?: Function): ?Promise<void>,
};
declare function fit(name: string, fn: Function): ?Promise<void>;
/** An individual test unit */
declare var test: typeof it;
/** A disabled group of tests */
declare var xdescribe: typeof describe;
/** A focused group of tests */
declare var fdescribe: typeof describe;
/** A disabled individual test */
declare var xit: typeof it;
/** A disabled individual test */
declare var xtest: typeof it;

/** The expect function is used every time you want to test a value */
declare var expect: {
  /** The object that you want to make assertions against */
  (value: any): JestExpectType,
  /** Add additional Jasmine matchers to Jest's roster */
  extend(matchers: {[name:string]: JestMatcher}): void,
  assertions(expectedAssertions: number): void,
  any(value: mixed): JestAsymmetricEqualityType,
  anything(): void,
  arrayContaining(value: Array<mixed>): void,
  objectContaining(value: Object): void,
  stringMatching(value: string | RegExp): void,
};

// TODO handle return type
// http://jasmine.github.io/2.4/introduction.html#section-Spies
declare function spyOn(value: mixed, method: string): Object;

/** Holds all functions related to manipulating test runner */
declare var jest: JestObjectType

/**
 * The global Jamine object, this is generally not exposed as the public API,
 * using features inside here could break in later versions of Jest.
 */
declare var jasmine: {
  DEFAULT_TIMEOUT_INTERVAL: number,
  any(value: mixed): JestAsymmetricEqualityType,
  anything(): void,
  arrayContaining(value: Array<mixed>): void,
  clock(): JestClockType,
  createSpy(name: string): JestSpyType,
  createSpyObj(baseName: string, methodNames: Array<string>): {[methodName: string]: JestSpyType},
  objectContaining(value: Object): void,
  stringMatching(value: string): void,
}
