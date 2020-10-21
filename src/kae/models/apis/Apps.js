import { Fetch, apiCallback } from './Fetch';
import {baseApiUrl} from '../../config';

// 获取app列表
export function list() {
  return Fetch.get(`${baseApiUrl}/app`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app list, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
};

export function get(appName) {
  return Fetch.get(`${baseApiUrl}/app/${appName}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app detail(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
};

export function remove(appName) {
  return Fetch.delete(`${baseApiUrl}/app/${appName}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't delete app(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function create(appName, git, type) {
  let params = {
    appname: appName,
    git: git,
    type: type
  };
  return Fetch.post(`${baseApiUrl}/app`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't create app(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// app_scale
export function scale(appName, cluster, replicas) {
  let data= {
    'replicas': replicas,
    'cluster': cluster
  };
  return Fetch.put(`${baseApiUrl}/app/${appName}/scale`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't scale app, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_renew
export function renew(appName, cluster) {
  let data = {
    'cluster': cluster
  };
  return Fetch.put(`${baseApiUrl}/app/${appName}/renew`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't recreate app pods, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getGrafanaDashboard(appName, cluster) {
  let params = {
    'cluster': cluster
  };
  return Fetch.get(`${baseApiUrl}/app/${appName}/grafana_dashboard?cluster=${cluster}`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app grafana dashboard(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
};

export function listDeployVersion(appName, cluster) {
  let params = {
    'cluster': cluster
  };
  return Fetch.get(`${baseApiUrl}/app/${appName}/deploy_history`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app deploy versions, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_rollback
export function rollback(appName, cluster, revision, deploy_id) {
  let params = {
    'cluster': cluster,
    'revision': revision,
    'deploy_id': deploy_id
  };
  return Fetch.put(`${baseApiUrl}/app/${appName}/rollback`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't rollback app pods, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// app_deploy
export function deploy(appName, params) {
  return Fetch.put(`${baseApiUrl}/app/${appName}/deploy`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't deploy app(${appName}), statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function undeploy(appName, cluster) {
  let params = {
    cluster: cluster
  };
  return Fetch.delete(`${baseApiUrl}/app/${appName}/undeploy`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't undeploy app(${appName}, ${cluster}), statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// app_deploy canary
export function deployCanary(appName, params) {
  return Fetch.put(`${baseApiUrl}/app/${appName}/canary/deploy`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't deploy app's canary deployment(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getCanaryInfo(appName, cluster) {
  return Fetch.get(`${baseApiUrl}/app/${appName}/canary?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app canary info(${appName}-${cluster}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// get app's k8s deployment
export function getDeployment(appName, cluster) {
  return Fetch.get(`${baseApiUrl}/app/${appName}/deployment?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app deployment(${appName}-${cluster}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// get app's k8s ingress
export function getIngress(appName, cluster) {
  return Fetch.get(`${baseApiUrl}/app/${appName}/ingress?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app ingress(${appName}-${cluster}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取releases
export function getReleases(appName) {
  return Fetch.get(`${baseApiUrl}/app/${appName}/releases`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app releases(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// 获取日志
export function getAuditLogs(appName) {
  return Fetch.get(`${baseApiUrl}/app/${appName}/oplogs`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app audit log(${appName}), statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function listAppYaml(appName) {
  return Fetch.get(`${baseApiUrl}/app/${appName}/yaml`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's yaml list, statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function createAppYaml(appName, params) {
  return Fetch.post(`${baseApiUrl}/app/${appName}/yaml`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't create app's yaml, statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function updateAppYaml(appName, name, params) {
  return Fetch.post(`${baseApiUrl}/app/${appName}/name/${name}/yaml`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't create app's yaml, statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
export function deleteAppYaml(appName, name) {
  return Fetch.delete(`${baseApiUrl}/app/${appName}/name/${name}/yaml`)
    .then(({statusCode, data}) => {
      const errMsg = `can't delete app's yaml, statusCode: ${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// delete app canary
export function deleteCanary(appName, cluster) {
  let data = {
    'cluster': cluster
  };
  return Fetch.delete(`${baseApiUrl}/app/${appName}/canary`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't delete app's canary deployment, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
export function setCanaryWeight(appName, weight, cluster) {
  let data = {
    'cluster': cluster,
    'weight': weight
  };

  return Fetch.post(`${baseApiUrl}/app/${appName}/canary/weight`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't set app canarys weight, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// set abtesting rules
export function setABTestingRules(appName, cluster, rules) {
  let data= {
    'cluster': cluster,
    'rules': rules
  };

  return Fetch.put(`${baseApiUrl}/app/${appName}/abtesting`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't set ABTesting rules for ${appName}-${cluster}, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// set abtesting rules
export function getABTestingRules(appName, cluster) {
  return Fetch.get(`${baseApiUrl}/app/${appName}/abtesting?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get abtesting rules, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// create or replace configmap
export function createConfigMap(name, params) {
  return Fetch.post(`${baseApiUrl}/app/${name}/configmap`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't create app's configmap, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getConfigMap(name, cluster) {
  return Fetch.get(`${baseApiUrl}/app/${name}/configmap?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's configmap, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getAppConfig(name, config_id) {
  return Fetch.get(`${baseApiUrl}/app/${name}/config/${config_id}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's config, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// create or replace secret
export function createSecret(name, params) {
  return Fetch.post(`${baseApiUrl}/app/${name}/secret`, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't create app's secret, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getSecret(name, cluster) {
  return Fetch.get(`${baseApiUrl}/app/${name}/secret?cluster=${cluster}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's secret, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getPodLog(appName, podName, cluster, container) {
  let url = `${baseApiUrl}/app/${appName}/pod/${podName}/log?cluster=${cluster}&container=${container}`;
  return Fetch.get(url)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's pod log, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function getPodEvents(appName, podName, uid, cluster) {
  let url = `${baseApiUrl}/app/${appName}/pod/${podName}/events?cluster=${cluster}&uid=${uid}`;
  return Fetch.get(url)
    .then(({statusCode, data}) => {
      const errMsg = `can't get app's pod events, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function stopContainer(appName, podName, cluster, container) {
  let params = {
    'podname': podName,
    'cluster': cluster,
  };
  if (container) {
    params.container = container;
  }
  let url = `${baseApiUrl}/app/${appName}/container/stop`;
  return Fetch.post(url, params)
    .then(({statusCode, data}) => {
      const errMsg = `can't stop contaienr, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
export function killBuildTask(appName) {
  let url = `${baseApiUrl}/app/${appName}/build/kill`;
  return Fetch.delete(url)
    .then(({statusCode, data}) => {
      const errMsg = `can't kill build task, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
// -----------------------------------------------------------------------
// app_cluster
export function listCluster() {
  return Fetch.get(`${baseApiUrl}/cluster`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get cluster list, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
