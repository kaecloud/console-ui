import _ from 'lodash';

export function createReducer(initialState, handlers) {
  return function(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
}

export function createAction(type, ...argNames) {
  return function(...args) {
    let action = { type };
    _.forEach(argNames, (arg, index) => {
      action[arg] = args[index];
    });
    return action;
  };
}

export function getRequests(props, types) {
  return _.map(types, (type) => getRequestFromProps(props, type));
}

export function getPageRequests(props, types) {
  const requests = _.map(types, (type) => getRequestFromProps(props, type));
  const isFetching = _.some(requests, (r) => r.isFetching);
  let error = '';
  const firstError = _.find(requests, (r) => r.error);
  if (firstError) {
    error = firstError.error;
  }
  return { requests, isFetching, error };
}

export function getRequestFromProps(props, type) {
  return props[type] || {
    apiType: type,
    isFetching: false,
    statusCode: 0,
    error: '',
    opFlash: '',
    data: null,
  };
}
