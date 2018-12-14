import React from 'react';
import {notification} from 'antd';

import store from '../models/Store';
import * as AppActions from '../models/actions/Apps';
import {getPageRequests, getRequestFromProps} from '../models/Utils';

export function getArg(name) {
  var i = new RegExp(name + "=([^&]+)","i")
  , n = location.href.match(i);
  return n ? n[1]:false;
}

export function setArg(name, val) {
  var re = new RegExp(name + "=([^&]*)","i");
  var newUrl = location.href.replace(re, name+"="+val);
  location.href = newUrl;
}

export function isHttpOK(code) {
  return code >= 200 && code < 300;
}

// 显示信息
export function notifyApiResult(statusCode, data, action) {
  notification.destroy();

  if (isHttpOK(statusCode)) {
    if(!!! data.error) {
      notification.success({
        message: '成功！',
        description: `${action} Success!`
      });
    } else {
      notification.error({
        message: '失败！',
        description: `${action} Failed: ${data.error}`,
        duration: 0
      });
    }
  } else {
    let ss = data.error;
    if (!!! data.error) {
      ss = JSON.stringify(data, undefined, 2);
    }

    notification.error({
      message: '失败！',
      description: `${action} Failed: ${ss}`,
      duration: 0
    });
  }
}

export function processApiResult(promise, action) {
  return promise
    .then(({statusCode, data}) => {
      notifyApiResult(statusCode, data, action);
      return data;
    }).catch(({statusCode, data}) => {
      notifyApiResult(statusCode, data, action);
      return Promise.reject(data);
    });
}

export function getNowCluster(props) {
  const request = getRequestFromProps(props, 'CURRENT_CLUSTER');
  let nowCluster = request.data;
  // let nowCluster = getArg("cluster");
  // if(!nowCluster) {
  //   let clusterNameList = getClusterNameList(props);
  //   if (clusterNameList.length > 0) {
  //     nowCluster= clusterNameList[0];
  //     store.dispatch(AppActions.setCurrentCluster(nowCluster));
  //   }
  // }
  return nowCluster? nowCluster: null;
}

export function getClusterNameList(props) {
  const request = getRequestFromProps(props, 'LIST_CLUSTER_REQUEST');
  let clusterNameList = [];
  if (request.statusCode === 200) {
    clusterNameList = request.data;
  }
  return clusterNameList;
}
