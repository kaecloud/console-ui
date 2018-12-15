import * as JobApi from '../apis/Jobs';

export function list() {
  return {
    type: 'LIST_JOB_REQUEST',
    async: true,
    shouldCallApi: (state) => true,
    callApi: () => JobApi.list(),
    payload: {}
  };
}

export function remove(jobName) {

}
