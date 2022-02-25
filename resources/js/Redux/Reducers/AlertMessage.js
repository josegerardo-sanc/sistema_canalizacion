import { _handleAlertMessage } from '../../Redux/Actions/AlertMessage'

let initialState = {
    'message': [],
    'type': null,
    'showMessage': false
};

const AlertMessage = (state = initialState, action) => {
    switch (action.type) {
        case _handleAlertMessage:
            return {
                ...action.payload
            }
        default:
            return state
    }
}

export default AlertMessage;