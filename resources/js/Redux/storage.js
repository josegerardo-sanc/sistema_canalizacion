import React from "react";
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

/**middleware */
import { middleware } from './Middleware/index'
/**Reducers */
import Auth from './Reducers/Auth';
import AlertMessage from './Reducers/AlertMessage';
import Preloader from './Reducers/Preloader';
import Notifications from './Reducers/Notifications';


const _combineReducers = combineReducers({
    Auth,
    AlertMessage,
    Preloader,
    Notifications
});


/**
 * combineReducers _combineReducers
 * initialProps {}
 * composeEnhancers(applyMiddleware(thunk, middleware))
*/


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    _combineReducers,
    {},
    composeEnhancers(applyMiddleware(thunk, middleware))
)

export default store;
