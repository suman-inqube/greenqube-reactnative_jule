import { createStore } from 'redux';
import locationReducer from './reducers/locationReducer'; // Assuming you have a location reducer
const store = createStore(locationReducer);
export default store;
