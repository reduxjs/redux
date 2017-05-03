import {Component, View} from 'angular2/angular2';
import {createRedux} from 'redux';
import * as stores from '../stores';
import {CounterApp} from './CounterApp';

@Component({
  selector: 'root'
})
@View({
  directives: [ CounterApp ],
  template: `
  <counter-app [redux]="redux"></counter-app>
  `
})
export class App {
  redux: any;
  constructor() {
    this.redux = createRedux(stores);
  }
}
