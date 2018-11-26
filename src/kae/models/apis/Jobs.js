import {baseApiUrl} from '../../config';
import Fetch from './Fetch';

function apiCallback(statusCode, data, defaultErrMsg) {
  if (statusCode === 200 && data) {
    return Fetch.wrap(statusCode, data);
  }
  const rej = Fetch.wrap(statusCode, data.msg || defaultErrMsg);
  return Promise.reject(rej);
}
// 获取job列表
export function list() {
  return Fetch.get(`${baseApiUrl}/job`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get job list, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// create_job
export function create(data) {
  return Fetch.post(`${baseApiUrl}/job`, data)
    .then(({statusCode, data}) => {
      const errMsg = `can't create job, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// job_restart
export function restart(jobName) {
  return Fetch.put(`${baseApiUrl}/job/${jobName}/restart`)
    .then(({statusCode, data}) => {
      const errMsg = `can't restart job, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

// job_delete
export function remove(jobName) {
  return Fetch.delete(`${baseApiUrl}/job/${jobName}`)
    .then(({statusCode, data}) => {
      const errMsg = `can't delete job, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
