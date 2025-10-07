
const initialState = {
    locationData: null
};
const locationReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_LOCATION':
            return { ...state, locationData: action.payload };
        default:
            return state;
    }
};
export default locationReducer;
