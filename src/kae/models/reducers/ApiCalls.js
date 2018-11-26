import _ from 'lodash';
import {createReducer} from '../Utils';

/*
 * State Shape:
 * {
 *  ...
 *  apiCalls: {
 *    [requestType]: {
 *      apiType: 'USER_LOGIN_REQUEST',
 *      isFetching: true,
 *      statusCode: 200,
 *      error: '',
 *      opFlash: '',
 *      data: {request payload},
 *    }
 *  },
 *  ...
 * }
 */

function getInitRequest(action) {
  return {
    apiType: action.asyncType,
    isFetching: false,
    statusCode: 0,
    error: '',
    opFlash: '',
    data: null,
  };
}

function genHandlers() {
  let handlers = {};
  const apiTypes = [
    'LOAD_APPS_REQUEST', 'GET_APP_REQUEST', 'DELETE_APP_REQUEST',
    'GET_APP_DEPLOYMENT_REQUEST',
    'REGISTER_APP_REQUEST', 'DEPLOY_APP_REQUEST',
    'GET_APP_RELEASES_REQUEST', 'GET_APP_LOGS_REQUEST',
    'GET_APP_YAML_REQUEST',
  ];
  _.forEach(apiTypes, (ty) => {
    handlers[ty] = (state, action) => {
      const newRequest = _.assign({}, getInitRequest(action), {
        isFetching: true,
      });
      return _.assign({}, state, {
        [action.asyncType]: newRequest,
      });
    };

    handlers[`${ty}_COMPLETED`] = (state, action) => {
      const newRequest = _.assign({}, getInitRequest(action), {
        isFetching: false,
        statusCode: action.statusCode,
        data: action.response,
        opFlash: action.flash,
      });
      return _.assign({}, state, {
        [action.asyncType]: newRequest,
      });
    };

    handlers[`${ty}_FAILED`] = (state, action) => {
      const newRequest = _.assign({}, getInitRequest(action), {
        isFetching: false,
        statusCode: action.statusCode,
        error: action.error,
        data: null,
        opFlash: action.flash,
      });
      return _.assign({}, state, {
        [action.asyncType]: newRequest,
      });
    };
  });

  handlers['RESET_APP_OP_FLASH'] = (state, action) => {
    const {apiType} = action;
    if (!state.hasOwnProperty(apiType)) {
      return state;
    }
    const newRequest = _.assign({}, state[apiType], { opFlash: '' });
    return _.assign({}, state, {
      [apiType]: newRequest,
    });
  };

  handlers['RESET_API_CALL'] = (state, action) => {
    const {apiType} = action;
    if (!state.hasOwnProperty(apiType)) {
      return state;
    }
    return _.assign({}, state, {
      [apiType]: getInitRequest({ asyncType: apiType }),
    });
  };
  return handlers;
}

const ApiCalls = createReducer({}, genHandlers());
export default ApiCalls;
