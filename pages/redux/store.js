import { createStore } from 'redux';
import locationReducer from './reducers/locationReducer';
import LoanReducer from './reducers/LoanUpdate';
import { combineReducers } from 'redux';
const routeReducer = combineReducers({
    locationReducer,
    LoanReducer
});
const store = createStore(routeReducer);
export default store;
