import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "../middleware/logger.js";
import { devToolsEnhancer } from "redux-devtools-extension";
import reducers from "../reducers";
const store = createStore(reducers, {}, applyMiddleware(logger, thunk));
export default store;
