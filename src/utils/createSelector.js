import identity from '../utils/identity.js';

export default function createSelector(...selectors) {
  if(selectors.length == 1) {
    selectors.push( identity );
  }
  let selector = selectors.pop();
  return state => {
    let selectorParams = selectors.map((inputSelector) => toSelector( inputSelector )(state));
    return selector(...selectorParams);
  }
}

function toSelector( functionOrKey ) {
  if( typeof functionOrKey == 'function' ) {
    return functionOrKey;
  } else {
    return (state) => state[functionOrKey];
  }
}