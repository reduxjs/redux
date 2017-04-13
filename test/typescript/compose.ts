import {compose} from "../../index";

// copied from DefinitelyTyped/compose-function

const numberToNumber = (a: number): number => a + 2;
const numberToString = (a: number): string => "foo";
const stringToNumber = (a: string): number => 5;

const t1: number = compose(numberToNumber, numberToNumber)(5);
const t2: string = compose(numberToString, numberToNumber)(5);
const t3: string = compose(numberToString, stringToNumber)("f");
const t4: (a: string) => number = compose(
  (f: (a: string) => number) => ((p: string) => 5),
  (f: (a: number) => string) => ((p: string) => 4)
)(numberToString);


const t5: number = compose(stringToNumber, numberToString, numberToNumber)(5);
const t6: string = compose(numberToString, stringToNumber, numberToString,
  numberToNumber)(5);

const t7: string = compose(
  numberToString, numberToNumber, stringToNumber, numberToString,
  stringToNumber)("fo");


const multiArgFn = (a: string, b: number, c: boolean): string => 'foo'

const t8: string = compose(multiArgFn)('bar', 42, true);
const t9: number = compose(stringToNumber, multiArgFn)('bar', 42, true);
const t10: string = compose(numberToString, stringToNumber,
  multiArgFn)('bar', 42, true);

const t11: number = compose(stringToNumber, numberToString, stringToNumber,
  multiArgFn)('bar', 42, true);


const funcs = [stringToNumber, numberToString, stringToNumber];
const t12 = compose(...funcs)('bar', 42, true);
