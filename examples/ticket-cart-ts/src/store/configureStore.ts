import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware, Middleware, compose } from 'redux'
import { createLogger } from 'redux-logger'

import { rootReducer } from './reducers'
import { rootSaga } from './sagas'

export function configureAppStore() {
  const sagaMiddleware = createSagaMiddleware()

  const middlewares: Middleware[] = [sagaMiddleware]

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(createLogger())
  }

  const composeEnhancer =
    (process.env.NODE_ENV !== 'production' &&
      ((window as any)
        .__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as typeof compose)) ||
    compose

  const enhancer = composeEnhancer(applyMiddleware(...middlewares))

  const store = createStore(rootReducer, enhancer)

  sagaMiddleware.run(rootSaga)

  return store
}
