import { _handlePreloader } from '../Actions/Preloader'

let initialState = {
    'showPreloader': false
};

const Preloader = (state = initialState, action) => {
    switch (action.type) {
        case _handlePreloader:
            return {
                'showPreloader': action.payload
            }
        default:
            return state
    }
}

export default Preloader;