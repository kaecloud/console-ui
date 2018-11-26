import {combineReducers} from 'redux';
import ApiCalls from './ApiCalls';

/*
 * State shape:
 * {
 *  apiCalls: {}, // refer to the asyncCalls reducer
 * }
 */

const rootReducer = combineReducers({
  apiCalls: ApiCalls,
});

export default rootReducer;
