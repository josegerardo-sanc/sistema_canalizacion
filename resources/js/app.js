
import React from "react";
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './Redux/storage';
/*routing*/
import Routing from './Route/Routing'

if (document.getElementById('root')) {
    ReactDOM.render(
        <Provider store={store}>
            <Routing />
        </Provider>
        , document.getElementById('root')
    );
}
