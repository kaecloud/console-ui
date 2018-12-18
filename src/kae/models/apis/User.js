import { Fetch, apiCallback } from './Fetch';

import {baseUrl} from '../../config';

// get current user
export function getCurrentUser() {
  return Fetch.get(`${baseUrl}/user/me`)
    .then(({statusCode, data}) => {
      const errMsg = `can't get current user, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}

export function logout() {
  return Fetch.get(`${baseUrl}/user/logout`)
    .then(({statusCode, data}) => {
      const errMsg = `can't logout current user, statusCode：${statusCode}`;
      return apiCallback(statusCode, data, errMsg);
    });
}
