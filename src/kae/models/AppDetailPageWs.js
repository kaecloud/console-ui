import store from './Store';
import * as AppActions from './actions/Apps';

const AppPodsWatcher = {
  podsWatcherWs: null,
  canaryPodsWatcherWs: null,
  cluster: null,
  appName: null,

  reload(appName, cluster) {
    if ((! cluster) || (! appName)) {
      console.log("null value found, skip reload.", cluster, appName);
      return;
    }
    if ((cluster === this.cluster) && (appName === this.appName)) {
      console.log("appName and cluster are equal to current, skip reload.", cluster, appName);
      return;
    }
    this.cluster = cluster;
    this.appName = appName;

    store.dispatch(AppActions.resetApiCall('APP_PODS_EVENT'));
    store.dispatch(AppActions.resetApiCall('APP_CANARY_PODS_EVENT'));

    // pods watcher
    this.createPodsWatcher(appName, cluster, false);
    // canary pods watcher
    this.createPodsWatcher(appName, cluster, true);
  },

  close() {
    if (this.podsWatcherWS) {
      this.podsWatcherWS.close();
    }
    if (this.canaryPodsWatcherWS) {
      this.canaryPodsWatcherWS.close();
    }
    this.appName = null;
    this.cluster = null;
    this.podsWatcherWS = null;
    this.canaryPodsWatcherWS = null;
  },

  extractDataFromPod(pod) {
    var msToHuman = function(ms) {
      var numdays, numhours, numminutes;
      var seconds = ms / 1000;
      numdays = Math.floor(seconds / 86400);
      if (numdays > 0) {
        return numdays + 'd';
      }
      numhours = Math.floor(seconds / 3600);
      if (numhours > 0) {
        return numhours + 'h';
      }
      numminutes = Math.floor(seconds / 60);
      if (numminutes > 0) {
        return numminutes + 'm';
      }
      return seconds + 's';
    };
    let status = pod.status.phase;
    let container_names = [];
    // get ready count
    let restart_count = 0;
    let ready_count = 0;
    let ready_total = pod.spec.containers.length;
    if (pod.status.container_statuses) {
      for (let cont_status of pod.status.container_statuses) {
        container_names.push(cont_status.name);
        if (cont_status.ready) {
          ready_count++;
        } else {
          if (cont_status.state.terminated) {
            status = cont_status.state.terminated.reason;
          } else if (cont_status.state.waiting) {
            status = cont_status.state.waiting.reason;
          }
        }
        if (cont_status.restart_count > restart_count) {
          restart_count = cont_status.restart_count;
        }
      }
    }
    let start_time_str = pod.status.start_time;
    if (start_time_str && !start_time_str.endsWith("GMT")) {
      start_time_str += " GMT";
    }
    let start_time = new Date(start_time_str);
    let interval = Date.now() - start_time;

    let data = {
      pod: pod,
      container_names: container_names,
      ready_count: ready_count,
      ready_total: ready_total,
      ready: ready_count + "/" + ready_total,
      name: pod.metadata.name,
      status: status,
      restarts: restart_count,
      age: msToHuman(interval),
      ip: pod.status.pod_ip,
      node: pod.status.host_ip
    };
    return data;
  },

  createPodsWatcher(name, cluster, canary) {
    let that = this;
    let prodSchema = "ws:";
    if (window.location.protocol === "https:") {
      prodSchema = "wss:";
    }
    const canaryStr = canary? "canary": "";

    const wsUrl = process.env.NODE_ENV === 'production' ? prodSchema + '//'+window.location.host : 'ws://192.168.1.17:5000';
    const ws = new WebSocket(`${wsUrl}/api/v1/ws/app/${name}/pods/events`);
    ws.onopen = function(evt) {
      ws.send(`{"cluster": "${cluster}", "canary": ${canary}}`);
    };
    ws.onclose = function(evt) {
      console.info(`${canaryStr} pods websocket connection closed`);
      let stateWs = that.podsWatcherWS;
      if (canary) {
        stateWs = that.canaryPodsWatcherWS;
      }
      if (ws === stateWs) {
        console.info(`recreate ${canaryStr} pods watcher websocket..`);
        setTimeout(function() {
          that.createPodsWatcher(name, cluster, canary);
        }, 5000);
      }
    };
    ws.onerror = function(evt) {
      console.error(`${canaryStr} pods websocket connection got an error`);
      ws.close();
    };
    that.webSocketEvent(ws, canary);
    // set websocket in state
    if (canary) {
      if (that.canaryPodsWatcherWS) {
        // console.log("close canary pods watcher");
        that.canaryPodsWatcherWS.close();
      }
      that.canaryPodsWatcherWS= ws;
    } else {
      if (that.podsWatcherWS) {
        // console.log("close pods watcher");
        that.podsWatcherWS.close();
      }
      that.podsWatcherWS= ws;
    }
    return ws;
  },

  mergeEvent(oldData, event) {
    let tmp = JSON.parse(event.data);
    let action = tmp.action;
    if (! tmp.object) {
      return oldData;
    }
    let data = this.extractDataFromPod(tmp.object);

    let temp = oldData;

    let podIndex = undefined;
    for (const [index, value] of temp.entries()) {
      if (value.name === data.name) {
        podIndex = index;
      }
    }
    if (action === 'ADDED') {
      if(podIndex === undefined) {
        temp.push(data);
      } else {
        temp.splice(podIndex, 1, data);
      }
    } else if(action === 'MODIFIED') {
      if(podIndex !== undefined) {
        temp.splice(podIndex, 1, data);
      }
    } else if(action === 'DELETED') {
      if(podIndex !== undefined) {
        temp.splice(podIndex, 1);
      }
    }
    return temp;
  },

  // Websocket
  webSocketEvent(socket, canary) {
    socket.addEventListener('message', function (event) {
      // ignore heartbeart message
      if (event.data === "PONG") {
        return;
      }
      if (canary) {
        store.dispatch(AppActions.canaryPods(event));
      } else {
        store.dispatch(AppActions.pods(event));
      }

    }, false);
  }

};

export default AppPodsWatcher;
