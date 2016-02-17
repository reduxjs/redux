import {createStore} from "../../index.d.ts";

const store = createStore((state: any) => state, {
  some: {deep: {property: 42}}
});

function select(state: any) {
  return state.some.deep.property
}

let currentValue: number;
function handleChange() {
  let previousValue = currentValue;
  currentValue = select(store.getState());

  if (previousValue !== currentValue) {
    console.log('Some deep nested property changed from', previousValue, 'to', currentValue)
  }
}

let unsubscribe = store.subscribe(handleChange);
handleChange();
