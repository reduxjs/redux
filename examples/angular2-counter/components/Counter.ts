import {Component, View, ON_PUSH} from 'angular2/angular2';

@Component({
  selector: 'counter',
  changeDetection: ON_PUSH,
  properties: ['counter', 'actions']
})
@View({
  directives: [],
  template: `
  <p>
    Clicked: {{ counter }} times
    <button (^click)="actions.increment()">+</button>
    <button (^click)="actions.decrement()">-</button>
    <button (^click)="actions.incrementIfOdd()">Increment if odd</button>
  </p>
  `
})
export class Counter {
  counter: number;
  actions: any;
  constructor() {}
}
