

/**configurations */
import { pathApi } from '../../env'
import { fetchRequest } from './fetchRequest'

/**match con el action.type */
export const request_Notifications = "@request_Notifications";
export const save_Notifications = "@save_Notifications";

/**action */
export const requestNotifications = (state) => {
    return {
        type: request_Notifications
    }
}

export const saveNotifications = (state) => {
    return {
        type: save_Notifications,
        payload: state
    }
}



/*get notifications */
export const getNotifications = async (store) => {

    const { Auth } = store.getState();

    const token = Auth.token;

    let request = {
        'url': `${pathApi}/getReminders`,
        'request': {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 'match_date': '' })
        }
    };

    const response = await store.dispatch(fetchRequest(request));
    //console.log(response)
    if (response.status == 200) {
        store.dispatch(saveNotifications(response.data));
    }
}

