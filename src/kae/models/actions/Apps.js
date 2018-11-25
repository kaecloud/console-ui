import * as AppApi from '../apis/Apps';

export function resetApiFlash(apiType) {
  return {
    type: 'RESET_APP_OP_FLASH',
    apiType,
  };
}

export function resetApiCall(apiType) {
  return {
    type: 'RESET_API_CALL',
    apiType,
  };
}

export function list() {
  return {
    type: 'LOAD_APPS_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.listApp(),
    payload: {},
  };
}

export function get(name) {
  return {
    type: 'GET_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getApp(name),
    payload: { name },
  };
}

export function upgrade(name, metaVersion='') {
  return {
    type: 'UPGRADE_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.upgrade(name, metaVersion),
    payload: { name },
  };
}

export function remove(name) {
  return {
    type: 'DELETE_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.deleteApp(name),
    payload: { name },
  };
}

export function register(name) {
  return {
    type: 'REGISTER_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.register(name),
    payload: { name },
  };
}

export function deploy(name) {
  return {
    type: 'DEPLOY_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.deploy(name),
    payload: { name },
  };
}

export function getReleases(name) {
  return {
    type: 'GET_APP_RELEASES_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getReleases(name),
    payload: {},
  };
}

export function getLogs(name) {
  return {
    type: 'GET_APP_LOGS_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getLogs(name),
    payload: {},
  };
}
