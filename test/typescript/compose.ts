import {compose} from "../../index.d.ts";

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
const t6: string = compose(numberToString, stringToNumber, numberToString, numberToNumber)(5);

const t7: string = compose<string>(
  numberToString, numberToNumber, stringToNumber, numberToString, stringToNumber)("fo");
