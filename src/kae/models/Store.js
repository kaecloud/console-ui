import {createStore, applyMiddleware} from 'redux';
import { createLogger } from 'redux-logger';
import { rootReducer } from './reducers';

const asyncApiCaller = store => next => action => {
  const {dispatch, getState} = store;
  const {
    type,
    async,
    shouldCallApi = () => true,
    callApi,
    payload = {}
  } = action;

  if (async !== true) {
    return next(action);
  }

  if (!_.isFunction(callApi)) {
    throw new Error('Expected callApi to be a function.');
  }

  if (!shouldCallApi(getState())) {
    return;
  }

  const requestType = type;
  const completedType = `${type}_COMPLETED`;
  const failType = `${type}_FAILED`;
  dispatch(_.assign({}, payload, { type: requestType, asyncType: requestType }));

  const resolve = response => {
    return dispatch(_.assign({}, payload, {
      type: completedType,
      asyncType: requestType,
      statusCode: response.statusCode,
      response: response.data ,
      flash: response.flash,
    }));
  };

  const reject = error => {
    return dispatch(_.assign({}, payload, {
      type: failType,
      asyncType: requestType,
      statusCode: error.statusCode,
      error: error.data,
      flash: error.flash,
    }));
  };
  return callApi().then(resolve, reject);
};

let middlewares = [asyncApiCaller];
if (process.env.NODE_ENV !== 'production') {
  middlewares = [
    ...middlewares,
    createLogger(),
  ];
}

const store = applyMiddleware(...middlewares)(createStore)(rootReducer);
export default store;
