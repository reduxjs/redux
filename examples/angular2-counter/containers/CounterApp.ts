import {Component, View, onInit, onDestroy} from 'angular2/angular2';
import {bindActionCreators} from 'redux';
import {Counter} from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@Component({
  selector: 'counter-app',
  lifecycle: [onInit, onDestroy],
  properties: ['redux']
})
@View({
  directives: [ Counter ],
  template: `
  <counter [counter]="state.counter" [actions]="actions"></counter>
  `
})
export class CounterApp {
  state: any;
  redux: any;
  actions: any;
  unsubscribe: Function;
  constructor() {
  }
  onInit() {
    const handleChange = this.handleChange.bind(this);
    this.unsubscribe = this.redux.subscribe(handleChange);
    handleChange();
  }
  handleChange() {
    this.state = this.redux.getState();
    this.actions = bindActionCreators(CounterActions, this.redux.dispatch);
  }
  onDestroy() {
    this.unsubscribe();
  }
}
