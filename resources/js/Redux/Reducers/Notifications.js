
import { save_Notifications } from "../Actions/Notifications";

const notifications = [];


const Notifications = (state = notifications, action) => {

    switch (action.type) {
        case save_Notifications:

            return [
                ...action.payload
            ]

            break;
        default:
            return state;
            break;
    }

}

export default Notifications;