import {compose} from "../../index";

type First = 'first';
type Second = 'second';
type Third = 'third';
type Fourth = 'fourth';

const first: First = 'first';
const second: Second = 'second';
const third: Third = 'third';
const fourth: Fourth = 'fourth';

const firstToSecond = (a: First): Second => 'second';
const secondToThird = (a: Second): Third => 'third';
const thirdToFourth = (a: Third): Fourth => 'fourth';

const funcWithZeroArg = (): First => 'first';
const funcWithOneArg = (a: number): First => 'first';
const funcWithTwoArgs = (a: number, b: boolean): First => 'first';
const funcWithThreeArgs = (a: number, b: boolean, c: string): First => 'first';

// no args
const r1: First = compose()('first');

// ane functions
const r2: Second = compose(firstToSecond)('first');

// two functions
const r3: Second = compose(firstToSecond, funcWithZeroArg)();
const r4: Second = compose(firstToSecond, funcWithOneArg)(5);
const r5: Second = compose(firstToSecond, funcWithTwoArgs)(5, false);
const r6: Second = compose(firstToSecond, funcWithThreeArgs)(5, false, 'string');

// three functions
const r7: Third = compose(secondToThird, firstToSecond, funcWithZeroArg)();
const r8: Third = compose(secondToThird, firstToSecond, funcWithOneArg)(5);
const r9: Third = compose(secondToThird, firstToSecond, funcWithTwoArgs)(5, false);
const r10: Third = compose(secondToThird, firstToSecond, funcWithThreeArgs)(5, false, 'string');

// four functions
const r11: Fourth = compose(thirdToFourth, secondToThird, firstToSecond, funcWithZeroArg)();
const r12: Fourth = compose(thirdToFourth, secondToThird, firstToSecond, funcWithOneArg)(5);
const r13: Fourth = compose(thirdToFourth, secondToThird, firstToSecond, funcWithTwoArgs)(5, false);
const r14: Fourth = compose(thirdToFourth, secondToThird, firstToSecond, funcWithThreeArgs)(5, false, 'string');

// more than four functions
const r15: Fourth = compose(thirdToFourth, secondToThird, firstToSecond, funcWithZeroArg, funcWithZeroArg)('first');
