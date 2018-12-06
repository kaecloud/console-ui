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

export function pods(payload) {
  return {
    type: 'APP_PODS_EVENT',
    payload: payload
  };
}

export function canaryPods(payload) {
  return {
    type: 'APP_CANARY_PODS_EVENT',
    payload: payload
  };
}

export function list() {
  return {
    type: 'LIST_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.list(),
    payload: {}
  };
}

export function get(appName) {
  return {
    type: 'GET_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.get(appName),
    payload: { appName }
  };
}

export function remove(appName) {
  return {
    type: 'DELETE_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.delete(appName),
    payload: { appName }
  };
}

export function scale(appName, replicas, cluster) {
  return {
    type: 'SCALE_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.scale(appName, replicas, cluster),
    payload: { appName }
  };
}

export function renew(appName, cluster) {
  return {
    type: 'RENEW_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.renew(appName, cluster),
    payload: { appName }
  };
}

export function rollback(appName, params) {
  return {
    type: 'ROLLBACK_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.rollback(appName, params),
    payload: { appName }
  };
}

export function getCanaryInfo(appName, cluster) {
  return {
    type: 'GET_APP_CANARY_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getCanaryInfo(appName, cluster),
    payload: { appName }
  };
}

export function getDeployment(appName, cluster) {
  return {
    type: 'GET_APP_DEPLOYMENT_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getDeployment(appName, cluster),
    payload: { }
  };
}

export function getReleases(appName) {
  return {
    type: 'GET_APP_RELEASES_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getReleases(appName),
    payload: {}
  };
}

export function getAuditLogs(appName) {
  return {
    type: 'GET_APP_LOGS_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getAuditLogs(appName),
    payload: {}
  };
}

export function listAppYaml(appName) {
  return {
    type: 'LIST_APP_YAML_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.listAppYaml(appName),
    payload: {}
  };
}

export function createAppYaml(appName, params) {
  return {
    type: 'CREATE_APP_YAML_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.createAppYaml(appName, params),
    payload: {}
  };
}

export function deleteAppYaml(appName, name) {
  return {
    type: 'DELETE_APP_YAML_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.deleteAppYaml(appName, name),
    payload: {}
  };
}

export function getConfigMap(appName, cluster) {
  return {
    type: 'GET_APP_CONFIGMAP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getConfigMap(appName, cluster),
    payload: {}
  };
}

export function createConfigMap(appName, params) {
  return {
    type: 'CREATE_APP_CONFIGMAP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.createConfigMap(appName, params),
    payload: {}
  };
}

export function getSecret(appName, cluster) {
  return {
    type: 'GET_APP_SECRET_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getSecret(appName, cluster),
    payload: {}
  };
}

export function createSecret(appName, params) {
  return {
    type: 'CREATE_APP_SECRET_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.createSecret(appName, params),
    payload: {}
  };
}

export function getABTestingRules(appName, cluster) {
  return {
    type: 'GET_APP_ABTESTING_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getABTestingRules(appName, cluster),
    payload: {}
  };
}
export function setABTestingRules(appName, cluster, rules) {
  return {
    type: 'SET_APP_ABTESTING_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.setABTestingRules(appName, cluster, rules),
    payload: {}
  };
}
export function register(appName) {
  return {
    type: 'REGISTER_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.register(appName),
    payload: { appName },
  };
}

export function deploy(appName) {
  return {
    type: 'DEPLOY_APP_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.deploy(appName),
    payload: { appName },
  };
}

export function listCluster() {
  return {
    type: 'LIST_CLUSTER_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.listCluster(),
    payload: {},
  };
}

export function getCurrentUser() {
  return {
    type: 'GET_CURRENT_USER_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => AppApi.getCurrentUser(),
    payload: {}
  };
}
