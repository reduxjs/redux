import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import configureStore from './store/configureStore'
import 'todomvc-app-css/index.css'
import { start, StateInfoConfig } from 'navigation'

StateInfoConfig.build([
    { key: 'todomvc', initial: 'app', states: [
        { key: 'app', route: '{filter?}' }
    ]}   
]);

const store = configureStore()

var todomvc = StateInfoConfig.dialogs.todomvc;
todomvc.states.app.navigated =  () => {
    render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('root')
    );    
}

start();


