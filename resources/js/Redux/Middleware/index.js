import { refreshSesionAuth, verifySession } from '../Actions/Auth'
import { processRequest } from '../Actions/fetchRequest'
import { request_Notifications, getNotifications } from '../Actions/Notifications';


export const middleware = store => next => action => {
    // Mostramos en la consola el type de la accción y el timestamp
    // console.log(`Action dispatched: ${action.type}`);
    if (action.type == request_Notifications) {
        getNotifications(store);
    }
    if (action.type == 'request') {
        //muestrar los errores de las solictudes http
        return processRequest(store, action.payload)
    }

    if (action.type == verifySession) {
        setTimeout(() => {
            refreshSesionAuth(store)
        }, 2000);
    }
    // Devolvemos la acción para que continue el flujo habitual
    return next(action);
};


