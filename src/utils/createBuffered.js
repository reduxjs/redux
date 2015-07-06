import arrayEqual from '../utils/arrayEqual.js';

export default function createBuffered(fnToBuffer) {
  let lastParams = null;
  let lastResult = null;
  return (...currentArguments) => {
    if(!lastParams || !arrayEqual(currentArguments, lastParams)) {
      lastResult = fnToBuffer(...currentArguments);
      lastParams = currentArguments;
    }
    return lastResult;
  }
}
