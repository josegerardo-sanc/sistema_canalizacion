
import { saveSesion, signOff, updateDataUser } from '../../Redux/Actions/Auth';
import moment from 'moment'

let initialState = {
    auth: false
};

let storageAuth = localStorage.getItem("authenticated") !== undefined ? JSON.parse(localStorage.getItem("authenticated")) : undefined;


if (storageAuth != undefined && storageAuth.auth) {
    if (moment(storageAuth.expires_in, "YYYY-MM-DD HH:mm:ss").isValid() && storageAuth.expires_in > moment().format('YYYY-MM-DD HH:mm:ss')) {
        initialState = {
            ...storageAuth
        }
    } else {
        localStorage.removeItem('authenticated');
    }
}

const UsuarioAuth = (state = initialState, action) => {
    switch (action.type) {
        case saveSesion: {

            localStorage.setItem('authenticated', JSON.stringify({
                ...action.payload,
                auth: true
            }))

            return {
                ...action.payload,
                auth: true
            }
        }
        case updateDataUser: {
            let dataUser = JSON.parse(localStorage.getItem("authenticated"));
            localStorage.setItem('authenticated', JSON.stringify({
                ...dataUser,
                'user': action.payload,
                auth: true
            }))
            //console.log("payload", action.payload);
            return {
                ...dataUser,
                'user': action.payload,
                auth: true
            }

        }
        case signOff: {
            localStorage.removeItem('authenticated');
            return {
                auth: false
            }
        }
        default:
            return state
    }

}

export default UsuarioAuth;