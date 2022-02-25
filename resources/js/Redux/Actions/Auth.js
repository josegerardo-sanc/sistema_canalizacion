import moment from 'moment'
import { handleAlertMessage } from './AlertMessage'
import { fetchRequest } from './fetchRequest'

import { pathApi } from '../../env'

export const saveSesion = '@saveSesion';
export const signOff = '@signOff';
export const refreshSession = '@refreshSession';
export const verifySession = '@verifySession';
export const updateDataUser = '@updateDataUser';

export const saveSesionAuth = (state) => {
    return {
        type: saveSesion,
        payload: state
    }
}

export const updateDataUserAuth = (state) => {
    return {
        type: updateDataUser,
        payload: state
    }
}

export const signOffAuth = (state) => {
    return {
        type: signOff
    }
}

export const verifySessionAuth = () => {
    return {
        type: verifySession
    }
}

export const refreshSesionAuth = async (store) => {

    let storageAuth = localStorage.getItem("authenticated") !== undefined ? JSON.parse(localStorage.getItem("authenticated")) : undefined;
    //console.log(storageAuth);
    if (storageAuth != undefined && storageAuth.auth && moment(storageAuth.expires_in, "YYYY-MM-DD HH:mm:ss").isValid()) {

        let expirationDate = storageAuth.expires_in;
        let localDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let minutos = moment(expirationDate).diff(localDate, 'minutes');

        //console.log("fecha exp" + expirationDate, "fecha local" + localDate, "minutos :" + minutos);

        if (expirationDate < localDate) {

            store.dispatch(signOffAuth());
            /*
            store.dispatch(handleAlertMessage({
                'message': ["Su sesión ha caducado. Vuelva a iniciar sesión"],
                'type': 'danger',
                'showMessage': true
            }))
            */
        } else {
            if (minutos > 0 && minutos < 5) {
                let request = {
                    'url': `${pathApi}/refreshToken`,
                    'request': {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${storageAuth.token}`
                        }
                    }
                }
                const response = await store.dispatch(fetchRequest(request))
                if (response.status == 200) {
                    store.dispatch(saveSesionAuth(response.data));
                } else {
                    store.dispatch(signOffAuth());
                    /*
                    store.dispatch(handleAlertMessage({
                        'message': ["Su sesión ha caducado. Vuelva a iniciar sesión"],
                        'type': 'danger',
                        'showMessage': true
                    }))
                    */
                }
            }
        }

    } else {
        store.dispatch(signOffAuth());
    }
}

