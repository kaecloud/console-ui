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
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
};

export function getApp(appName) {
  return Fetch.get(`${baseUrl}/app/${appName}`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
};

export function getAppCanaryInfo(appName, cluster) {
  return Fetch.get(`${baseUrl}/app/${appName}/canary?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_cluster
export function getCluster() {
  return Fetch.get(`${baseUrl}/cluster`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// get app's k8s deployment
export function getAppDeployment(appName, cluster) {
  return Fetch.get(`${baseUrl}/app/${appName}/deployment?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取releases
export function getAppReleases(appName) {
  return Fetch.get(`${baseUrl}/app/${appName}/releases`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function deleteApp(appName) {
  return Fetch.delete(`${baseUrl}/app/${appName}`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取日志
export function getAppLogs(appName) {
  return Fetch.get(`${baseUrl}/app/${appName}/oplogs`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取用户ID
export function getUserId() {
  return Fetch.get(`${testUrl}/user/me`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取副本
export function getAppPods(appName, cluster) {
  return Fetch.get(`${baseUrl}/app/${appName}/pods?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getAppYamlList(appName) {
  return Fetch.get(`${baseUrl}/app/${appName}/yaml`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function createOrUpdateAppYaml(appname, params) {
  return Fetch.post(`${baseUrl}/app/${appname}/yaml`, params)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function deleteAppYaml(appname, name) {
  return Fetch.delete(`${baseUrl}/app/${appname}/name/${name}/yaml`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_deploy
export function deployApp(appName, params) {
  return Fetch.put(`${baseUrl}/app/${appName}/deploy`, params)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_deploy canary
export function deployAppCanary(appName, params) {
  return Fetch.put(`${baseUrl}/app/${appName}/canary/deploy`, params)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
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
        const errMsg = `无法获取App List，返回代码：${statusCode}`;
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
        const errMsg = `无法获取App List，返回代码：${statusCode}`;
        return apiCallback(statusCode, data, errMsg);
      });
}

// set abtesting rules
export function getAppABTestingRules(appName, cluster) {
  return Fetch.get(`${baseUrl}/app/${appName}/abtesting?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `无法获取App List，返回代码：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// app_scale
export function scaleApp(appName, replicas, cluster) {
  return axios({
    method: 'put',
    url: `${baseUrl}/app/${appName}/scale`,
    data: {
      'replicas': replicas,
      'cluster': cluster
    },
    headers: {
			'Content-Type': 'application/json'
    },
    transformResponse: [function (data) {
      return data;
    }],
  }).then(res => res.data);
}

// app_renew
export function renewApp(appname, cluster) {
  return axios({
    method: 'put',
    url: `${baseUrl}/app/${appName}/renew`,
    data: {
      'cluster': cluster,
    },
    headers: {
			'Content-Type': 'application/json'
    },
    transformResponse: [function (data) {
      return data;
    }],
  }).then(res => res.data);
}

// app_rollback
export function rollbackApp(appName, params) {
  return axios({
    method: 'put',
    url: `${baseUrl}/app/${appName}/rollback`,
    data: params,
    headers: {
			'Content-Type': 'application/json'
    },
    transformResponse: [function (data) {
      return data;
    }],
  }).then(res => res.data);
}

// create or replace configmap
export function postAppConfigMap(name, params) {
  return axios({
    method: 'post',
    url: `${baseUrl}/app/${name}/configmap`,
    data: params,
    headers: {
			'Content-Type': 'application/json'
    },
    transformResponse: [function (data) {
      return data;
    }],
  }).then(res => res.data);
}

export function getAppConfigMap(name, cluster) {
  return Fetch.get(`${baseUrl}/app/${name}/configmap?cluster=${cluster}`)
    .then(res => res.data);
}

export function postAppSecret(name, params) {
  return Fetch.post(`${baseUrl}/app/${name}/secret`, params)
    .then(res => res.data);
}

export function getAppSecret(name, cluster) {
  return Fetch.get(`${baseUrl}/app/${name}/secret?cluster=${cluster}`)
    .then(res => res.data);
}
// 获取job列表
export function listJob() {
  return Fetch.get(`${baseUrl}/job`)
    .then(res => res.data);
}

// create_job
export function createJob(data) {
  return axios({
    method: 'post',
    url: `${baseUrl}/job`,
    data: data,
    headers: {
			'Content-Type': 'application/json'
    },
    transformResponse: [function (data) {
      return data;
    }],
  }).then(res => res.data);
}

// job_restart
export function restartJob(jobName) {
  return axios({
    method: 'put',
    url: `${baseUrl}/job/${jobName}/restart`,
    headers: {
			'Content-Type': 'application/json'
    },
    transformResponse: [function (data) {
      return data;
    }],
  }).then(res => res.data);
}

// job_delete
export function deleteJob(jobName) {
  return axios.delete(`${baseUrl}/job/${jobName}`)
    .then(res => res.data);
}
