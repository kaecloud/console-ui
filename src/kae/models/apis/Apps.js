import Fetch from './Fetch';

// 测试地址
const testUrl = process.env.NODE_ENV === 'production' ? '' : 'http://192.168.1.17:5000';

const baseUrl = `${testUrl}/api/v1`;

function apiCallback(statusCode, data, defaultErrMsg) {
  if (statusCode === 200 && data.app) {
    return Fetch.wrap(statusCode, data);
  }
  const rej = Fetch.wrap(statusCode, data.msg || defaultErrMsg);
  return Promise.reject(rej);
}
// 获取app列表
export function listApp() {
  return Fetch.get(`${baseUrl}/app`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app list, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
};

export function getApp(appName) {
  return Fetch.get(`${baseUrl}/app/${appName}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app detail(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
};

export function getAppCanaryInfo(appName, cluster) {
  return Fetch.get(`${baseUrl}/app/${appName}/canary?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app canary info(${appName}-${cluster}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_cluster
export function getCluster() {
  return Fetch.get(`${baseUrl}/cluster`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get cluster list, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// get app's k8s deployment
export function getAppDeployment(appName, cluster) {
  return Fetch.get(`${baseUrl}/app/${appName}/deployment?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app deployment(${appNAme}-${cluster}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取releases
export function getAppReleases(appName) {
  return Fetch.get(`${baseUrl}/app/${appName}/releases`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app releases(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function deleteApp(appName) {
  return Fetch.delete(`${baseUrl}/app/${appName}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't delete app(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取日志
export function getAppLogs(appName) {
  return Fetch.get(`${baseUrl}/app/${appName}/oplogs`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app audit log(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取用户ID
export function getUserId() {
  return Fetch.get(`${testUrl}/user/me`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get current user, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取副本
export function getAppPods(appName, cluster) {
  return Fetch.get(`${baseUrl}/app/${appName}/pods?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app pods, statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getAppYamlList(appName) {
  return Fetch.get(`${baseUrl}/app/${appName}/yaml`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's yaml list, statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function createOrUpdateAppYaml(appname, params) {
  return Fetch.post(`${baseUrl}/app/${appname}/yaml`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't create app's yaml, statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function deleteAppYaml(appname, name) {
  return Fetch.delete(`${baseUrl}/app/${appname}/name/${name}/yaml`)
    .then(({statusCode, data}) => {
      const errMsg = `can't delete app's yaml, statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_deploy
export function deployApp(appName, params) {
  return Fetch.put(`${baseUrl}/app/${appName}/deploy`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't deploy app(${appName}), statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_deploy canary
export function deployAppCanary(appName, params) {
  return Fetch.put(`${baseUrl}/app/${appName}/canary/deploy`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't deploy app's canary deployment(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// delete app canary
export function deleteAppCanary(appName, cluster) {
  let data = {
    'cluster': cluster
  };
  return Fetch.delete(`${baseUrl}/app/${appName}/canary`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't delete app's canary deployment, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// set abtesting rules
export function setAppABTestingRules(appName, cluster, rules) {
  let data= {
    'cluster': cluster,
    'rules': rules
  };

  return Fetch.put(`${baseUrl}/app/${appName}/abtesting`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't set ABTesting rules for ${appName}-${cluster}, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// set abtesting rules
export function getAppABTestingRules(appName, cluster) {
  return Fetch.get(`${baseUrl}/app/${appName}/abtesting?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get abtesting rules, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// app_scale
export function scaleApp(appName, replicas, cluster) {
  let data= {
    'replicas': replicas,
    'cluster': cluster
  };
  return Fetch.put(`${baseUrl}/app/${appName}/scale`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't scale app, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_renew
export function renewApp(appname, cluster) {
  let data = {
    'cluster': cluster
  };
  return Fetch.put(`${baseUrl}/app/${appName}/renew`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't recreate app pods, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_rollback
export function rollbackApp(appName, params) {
  return Fetch.put(`${baseUrl}/app/${appName}/rollback`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't rollback app pods, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// create or replace configmap
export function postAppConfigMap(name, params) {
  return Fetch.post(`${baseUrl}/app/${name}/configmap`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't create app's configmap, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getAppConfigMap(name, cluster) {
  return Fetch.get(`${baseUrl}/app/${name}/configmap?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's configmap, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function postAppSecret(name, params) {
  return Fetch.post(`${baseUrl}/app/${name}/secret`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't create app's secret, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getAppSecret(name, cluster) {
  return Fetch.get(`${baseUrl}/app/${name}/secret?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's secret, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// 获取job列表
export function listJob() {
  return Fetch.get(`${baseUrl}/job`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get job list, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// create_job
export function createJob(data) {
  return Fetch.post(`${baseUrl}/job`, data)({
      .then(({statusCode, data}) => {
        const errMsg = `can't create job, statusCode：${statusCode}`;
        return apiCallback(statusCode, data, errMsg);
      });
}

// job_restart
export function restartJob(jobName) {
  return Fetch.put(`${baseUrl}/job/${jobName}/restart`)
    .then(({statusCode, data}) => {
      const errMsg = `can't restart job, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// job_delete
export function deleteJob(jobName) {
  return Fetch.delete(`${baseUrl}/job/${jobName}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't delete job, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
