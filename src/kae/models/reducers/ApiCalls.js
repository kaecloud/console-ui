import _ from 'lodash';
import {createReducer} from '../Utils';
import AppPodsWatcher from '../AppDetailPageWs';

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
    'LIST_APP_REQUEST', 'GET_APP_REQUEST', 'DELETE_APP_REQUEST',
    'GET_APP_CANARY_REQUEST', 'GET_APP_DEPLOYMENT_REQUEST',
    'GET_APP_RELEASES_REQUEST', 'GET_APP_LOGS_REQUEST',
    'LIST_APP_YAML_REQUEST',
    'GET_APP_SECRET_REQUEST', 'CREATE_APP_SECRET_REQUEST',
    'GET_APP_CONFIGMAP_REQUEST', 'CREATE_APP_CONFIGMAP_REQUEST',
    'GET_APP_ABTESTING_REQUEST', 'SET_APP_ABTESTING_REQUEST',
    'REGISTER_APP_REQUEST', 'DEPLOY_APP_REQUEST',
    'GET_APP_YAML_REQUEST',

    'LIST_JOB_REQUEST',

    'LIST_CLUSTER_REQUEST', "GET_CURRENT_CLUSTER_REQUEST",
    'GET_CURRENT_USER_REQUEST'
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

  handlers['APP_PODS_EVENT'] = (state, action) => {
    let {payload} = action;
    let oldData = _.assign({}, state['APP_PODS_EVENT']);
    let oldPods = oldData.data? oldData.data: [];
    // console.log(state, oldData, event);
    let newData = AppPodsWatcher.mergeEvent(oldPods, payload);

    const newRequest = _.assign({}, getInitRequest(action), {
      isFetching: false,
      statusCode: 200,
      data: newData,
      opFlash: ''
    });
    return _.assign({}, state, {
      'APP_PODS_EVENT': newRequest
    });
  };

  handlers['APP_CANARY_PODS_EVENT'] = (state, action) => {
    let {payload} = action;
    let oldData = _.assign({}, state['APP_CANARY_PODS_EVENT']);
    let oldPods = oldData.data? oldData.data: [];
    let newData = AppPodsWatcher.mergeEvent(oldPods, payload);

    const newRequest = _.assign({}, getInitRequest(action), {
      isFetching: false,
      statusCode: 200,
      data: newData,
      opFlash: ''
    });
    return _.assign({}, state, {
      'APP_CANARY_PODS_EVENT': newRequest
    });
  };

  handlers[`LIST_CLUSTER_REQUEST_COMPLETED`] = (state, action) => {
    const newRequest = _.assign({}, getInitRequest(action), {
      isFetching: false,
      statusCode: action.statusCode,
      data: action.response,
      opFlash: action.flash,
    });

    let clusterNameList = newRequest.data,
        currentClusterRequest = _.assign({}, state['CURRENT_CLUSTER']),
        currentCluster = currentClusterRequest.data;
    let changePart = {
      [action.asyncType]: newRequest,
    };
    if (( ! currentCluster ) && (clusterNameList.length > 0)) {
      changePart['CURRENT_CLUSTER'] = {
        isFetching: false,
        statusCode: 200,
        data: clusterNameList[0],
        opFlash: ''
      };
    }
    return _.assign({}, state, changePart);
  };

  handlers["SET_CURRENT_CLUSTER"] = (state, action) => {
    let {payload} = action;

    console.log("+++++++++++++++++", payload)
    const newRequest = _.assign({}, getInitRequest(action), {
      isFetching: false,
      statusCode: 200,
      data: payload,
      opFlash: ''
    });
    return _.assign({}, state, {
      'CURRENT_CLUSTER': newRequest
    });
  };

  return handlers;
}

const ApiCalls = createReducer({}, genHandlers());
export default ApiCalls;
