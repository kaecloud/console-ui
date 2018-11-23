import React from 'react';
import ReactDOM from 'react-dom';

import {
  Icon, Divider, Collapse, Table, Button, Modal, Row, Col, Select,
  Form, Input, InputNumber, Menu, Dropdown, Checkbox, notification,
  Progress
} from 'antd';
import { Link } from 'react-router-dom';
import {
  getDeployment, getAppCanaryInfo, getReleases, appDeploy, appDeployCanary,
  appDeleteCanary, appSetABTestingRules, appGetABTestingRules, appScale, appRollback,
  appRenew, getCluster, appPostConfigMap, appGetConfigMap, appPostSecret, appGetSecret,
  appPostReleaseSpec, getAppYamlList, deleteAppYaml, createOrUpdateAppYaml, deleteApp} from 'api';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/xcode';

import './index.css';
import {
  DeleteConfirmModal, AppYamlAddModal, AceEditorModal,
  ConfigMapModal, SecretFormModal, DeployModal
} from './modals';

const Panel = Collapse.Panel;
const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;

const spanStyle = {
  padding: '0 4px',
  marginRight: '4px',
  background: '#eee',
  border: '1px solid #ccc',
  borderRadius: '6px'
};

function extractDataFromPod(pod) {
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
  // get ready count
  let restart_count = 0;
  let ready_count = 0;
  let ready_total = pod.spec.containers.length;
  if (pod.status.container_statuses) {
    for (let cont_status of pod.status.container_statuses) {
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
}

function getArg(name) {
  var i = new RegExp(name + "=([^&]+)","i")
  , n = location.href.match(i);
  return n ? n[1]:false;
}

function setArg(name, val) {
  var re = new RegExp(name + "=([^&]*)","i");
  var newUrl = location.href.replace(re, name+"="+val);
  location.href = newUrl;
}

function getInitialState() {
  return {
    infoModal: {
      text: '',
      title: '',
      visible: false
    },
    configMapData: null,
    secretData: null,
    name: '',
    nowTag: '',
    replicas: 1,
    readyReplicas: 0,
    version: '',
    nowCluster: '',
    clusterNameList: [],
    scaleNum: 1,
    rollbackRevisionNum: 0,
    yamlList: [],
    releaseTableData: [],
    podTableData: [],
    canarypodTableData: [],
    textVisible: false,
    scaleVisible: false,
    rollbackVisible: false,
    canaryVisible: false
  };
}

class AppDetail extends React.Component {

  constructor() {
    super();

    let self = this;
    this.state = getInitialState();
    this.handleMsg = this.handleMsg.bind(this);
    this.showAceEditorModal = this.showAceEditorModal.bind(this);
    this.fetchDeploymentData = this.fetchDeploymentData.bind(this);
  }

  componentDidMount() {
    let that = this;

    // 获取APP name
    const name = getArg('app');
    const defaultCluster = getArg('cluster');

    // 测试地址
    const testUrl = process.env.NODE_ENV === 'production' ? '' : 'http://192.168.1.17:5000';

    if(!defaultCluster) {
      getCluster().then(res => {
        that.fetchAllData(name, res[0]);
      });
    }else {
      that.fetchAllData(name, defaultCluster);
    }

  }

  fetchAllData(name, cluster) {
    let that = this;
    that.setState(getInitialState());

    getCluster().then(res => {
      that.setState({
        clusterNameList: res
      });
    });

    that.setState({
      name: name,
      nowCluster: cluster
    });

    getAppYamlList(name).then(res => {
      that.setState({
        yamlList: res
      });
    });
    getReleases(name).then(res => {
      that.setState({
        releaseTableData: res
      });
    });

    getAppCanaryInfo({name:name, cluster:cluster}).then(res => {
      that.setState({
        canaryVisible: res.status
      });
    });
    that.fetchDeploymentData(name, cluster);
    // pods watcher
    that.createPodsWatcher(name, cluster, false);
    // canary pods watcher
    that.createPodsWatcher(name, cluster, true);
  }

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
      console.info(`"${canaryStr} pods websocket connection closed"`);
      let stateWs = that.state.podsWatcherWS;
      if (canary) {
        stateWs = that.state.canaryPodsWatcherWS;
      }
      if (ws == stateWs) {
        console.log("recreate websocket..");
        setTimeout(function() {
          that.createPodsWatcher(name, cluster, canary);
        }, 3000);
      }
    };
    ws.onerror = function(evt) {
      console.error(`"${canaryStr} pods websocket connection got an error"`);
      ws.close();
    };
    that.webSocketEvent(ws, canary);
    // set websocket in state
    if (canary) {
      if (that.state.canaryPodsWatcherWS) {
        // console.log("close canary pods watcher");
        that.state.canaryPodsWatcherWS.close();
      }
      that.setState({
        canaryPodsWatcherWS: ws
      });
    } else {
      if (that.state.podsWatcherWS) {
        // console.log("close pods watcher");
        that.state.podsWatcherWS.close();
      }
      that.setState({
        podsWatcherWS: ws
      });
    }
    return ws;
  }
  // Websocket
  webSocketEvent(socket, canary) {
    let self = this;
    socket.addEventListener('message', function (event) {
      let tmp = JSON.parse(event.data);
      let action = tmp.action;
      let data = extractDataFromPod(tmp.object);

      let { canarypodTableData, podTableData } = self.state;
      let temp = canary ? canarypodTableData : podTableData;

      let podIndex = undefined;
      for (const [index, value] of temp.entries()) {
        if (value.name === data.name) {
          podIndex = index;
        }
      }
      if(action === 'ADDED') {
        if(podIndex === undefined) {
          temp.push(data);
        } else {
          temp.splice(podIndex, 1, data);
        }
        if(canary) {
          self.setState({
            canarypodTableData: temp
          });
        }else {
          self.setState({
            podTableData: temp
          });
        }
      }else if(action === 'MODIFIED') {
        if(podIndex !== undefined) {
          temp.splice(podIndex, 1, data);
          if(canary) {
            self.setState({
              canarypodTableData: temp
            });
          }else {
            self.setState({
              podTableData: temp
            });
          }
        }
      }else if(action === 'DELETED') {
        if(podIndex !== undefined) {
          temp.splice(podIndex, 1);
          if(canary) {
            self.setState({
              canarypodTableData: temp
            });
          }else {
            self.setState({
              podTableData: temp
            });
          }
        }
      }
      if (! canary) {
        let readyReplicas = 0;
        for (const val of temp.values() ) {
          if (val.ready_count === val.ready_total) {
            readyReplicas++;
          }
        }
        self.setState({
          readyReplicas: readyReplicas
        });
      }
    }, false);
  }

  componentWillMount() {
  }

  fetchDeploymentData(name, cluster) {
    getDeployment({name: name, cluster: cluster}).then(res => {
      let deployment = res;

      this.setState({
        deploymentData: deployment,
        replicas: deployment.spec.replicas,
        readyReplicas: deployment.status.ready_replicas,
        version: res.metadata.annotations.release_tag
      });
    }).catch(err => {
      let resp = err.response;
      if (resp.status !== 404) {
        this.handleError(err);
      }
    });
  }

  handleChangeCluster(newCluster) {
    let {name} = this.state;
    this.fetchAllData(name, newCluster);
    setArg('cluster', newCluster);
  }

  showInfoModal(title, data) {
    if (!!!data) {
      data = "";
    }
    if (typeof data != 'string') {
      data = JSON.stringify(data, undefined, 2);
    }
    let text = data.replace(/\n/g, '<br/>');
    text = text.replace(/ /g, '&nbsp;&nbsp;');
    this.setState({
      infoModal: {
        title: title,
        text: text,
        visible: true
      }
    });
  }

  hiddenInfoModal() {
    this.setState({
      infoModal: {
        visible: false,
      }
    });
  }

  showAceEditorModal(config) {
    let self = this;

    if (! config.handler) {
      config.handler = function(specs, destroy) {
        destroy();
      };
    }
    let div = document.createElement('div');
    document.body.appendChild(div);

    function destroy(...args: any[]) {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    ReactDOM.render(<AceEditorModal config={config} destroy={destroy} />, div);
  }

  showAppDeployment() {
    let infoModal = this.state.infoModal;
    let dp = this.state.deploymentData;
    let labels = [],
        annotations = [],
        match_labels = [];

    // 详情的数据
    let namespace= dp.metadata.namespace,
        replicas= dp.spec.replicas,
        created= dp.metadata.creation_timestamp,
        history= dp.spec.revision_history_limit,
        rolling_update= dp.spec.strategy.rolling_update,
        strategy= dp.spec.strategy.type,
        min_ready_seconds= dp.spec.min_ready_seconds === null ? '0' : dp.spec.min_ready_seconds,
        status= dp.status;

    // 标签样式
    for (let p in dp.metadata.labels) {
      labels.push(<span style={spanStyle} key={p}>{p}: {dp.metadata.labels[p]}</span>);
    }
    // 选择器样式
    for (let p in dp.spec.selector.match_labels) {
      match_labels.push(<span style={spanStyle} key={p}>{p}: {dp.spec.selector.match_labels[p]}</span>);
    }
    // 注释样式
    for (let p in dp.metadata.annotations) {
      if(p !== 'app_specs_text') {
        annotations.push(<span style={spanStyle} key={p}>{p}: {dp.metadata.annotations[p]}</span>);
      }
    }

    infoModal.visible = true;
    infoModal.title = "Deployment";
    infoModal.text = (
      <div>
        <p>appname: {this.state.name} </p>
        <p>命名空间：{namespace}</p>
        <p>标签： {labels}</p>
        <p>注释： {annotations ? annotations : '无'}</p>
        <p>创建时间： {created}</p>
        <p>选择器： {match_labels}</p>
        <p>策略： {strategy}</p>
        <p>最小就绪秒数： {min_ready_seconds}</p>
        <p>历史版本限制值： {history}</p>
        <p>状态： {status.updated_replicas}个已更新，共计 {status.ready_replicas}个， {status.available_replicas}个可用， {status.unavailable_replicas === null ? '0' : status.unavailable_replicas}个不可用</p>
        <p>滚动更新策略： 最大激增数：{rolling_update.max_surge},
      最大无效数：{rolling_update.max_unavailable}</p>
        </div>
    );
    this.setState({infoModal: infoModal});
  }
  // 构建
  handleBuild(tag) {
    let self = this;
    let { name } = self.state;

    confirm({
      title: 'Build',
      content: `Are you sure to build image for app ${name} release ${tag}?`,
      onOk() {
        let infoModal = self.state.infoModal;
        infoModal.visible = true;
        infoModal.title = "Build Output";
        self.setState({infoModal: infoModal});

        let prodSchema = "ws:"
        if (window.location.protocol === "https:") {
          prodSchema = "wss:"
        }
        const wsUrl = process.env.NODE_ENV === 'production' ? prodSchema + '//'+window.location.host : 'ws://192.168.1.17:5000';
        const ws = new WebSocket(`${wsUrl}/api/v1/ws/app/${name}/build`);
        ws.onopen = function(evt) {
          ws.send(`{"tag": "${tag}"}`);
        };
        ws.onclose = function(evt) {
          // update release data
          getReleases(name).then(res => {
            self.setState({
              releaseTableData: res
            })
          });
          console.log("Build finished")
        }

        let text = ""
        let phase = null
        ws.onmessage = function(evt) {
          let data = JSON.parse(evt.data);
          if (! data.success) {
            text += `<p key=${data.error}>${data.error}</p>`
          } else {
            if (phase !== data['phase']) {
              text += `<p>***** PHASE ${data.phase}</p>`
              phase = data['phase']
            }
            if (data.phase.toLowerCase() === "pushing") {
              let raw_data = data['raw_data']
              if (raw_data.id && raw_data.status) {
                text += `<p>${raw_data.id}: ${raw_data.status}</p>`
              } else if (raw_data.digest) {
                text += `<p>${raw_data.status}: digest: ${raw_data.digest} size: ${raw_data.size}</p>`
              } else {
                text += `<p>${JSON.stringify(data)}</p>`
              }
            } else {
              text += `<p>${data.msg}</p>`
            }
          }

          infoModal.text = text
          self.setState({infoModal: infoModal})
        }
      },
      onCancel() {},
    });
  }

  showConfigMap() {
    const {name, nowCluster} = this.state

    appGetConfigMap(name, {cluster: nowCluster}).then(res => {
      this.setState({configMapData: res})
      this.showInfoModal("ConfigMap", res)
    }).catch(err => {
      this.handleError(err);
    });
  }

  handleConfigMap() {
    let self = this;
    let { name, nowCluster } = this.state;

    function createConfigMap(configMapData) {
      let div = document.createElement('div');
      document.body.appendChild(div);

      function destroy(...args: any[]) {
        const unmountResult = ReactDOM.unmountComponentAtNode(div);
        if (unmountResult && div.parentNode) {
          div.parentNode.removeChild(div);
        }
      }

      function submitForm(cluster_name, replace, cm_data) {
        let params = {
          replace: replace,
          data: cm_data,
          cluster: cluster_name
        }

        appPostConfigMap(name, params).then(res=> {
          destroy()
          self.handleMsg(res, "Create ConfigMap")
        }).catch(err => {
          self.handleError(err)
        })
      }
      let config = {
        destroy: destroy,
        handler: submitForm
      }

      let initialValue = {
        configMapData: configMapData,
        clusterNameList: self.state.clusterNameList,
        currentClusterName: self.state.nowCluster
      }
      console.log(initialValue)
      const WrappedConfigMapModal = Form.create()(ConfigMapModal);

      ReactDOM.render(<WrappedConfigMapModal config={config} initialValue={initialValue} />, div)
    }

    // we need initial value of form, so if configMapData is null, we need to get it from backend
    if (self.state.configMapData === null) {
      appGetConfigMap(name, {cluster: nowCluster}).then(res => {
        self.setState({configMapData: res})
        createConfigMap(res)
      }).catch(err => {
        let res = {}
        self.setState({configMapData: res})
        createConfigMap(res)
      });
    } else {
      createConfigMap(self.state.configMapData)
    }
  }

  showSecretModal() {
    let self = this

    function createSecret(secretData){
      let div = document.createElement('div');
      document.body.appendChild(div);

      function destroy(...args: any[]) {
        const unmountResult = ReactDOM.unmountComponentAtNode(div);
        if (unmountResult && div.parentNode) {
          div.parentNode.removeChild(div);
        }
      }

      function submitForm(cluster_name, replace, data) {
        let { name, nowCluster } = self.state;
        let params = {
          data: data,
          replace: replace,
          cluster: cluster_name
        }
        appPostSecret(name, params).then(res=> {
          self.handleMsg(res, "Create Secret")
          destroy()
        }).catch(err => {
          self.handleError(err)
        })
      }
      let config = {
        destroy: destroy,
        handler: submitForm
      }

      let initialValue = {
        secretData: JSON.stringify(secretData, undefined, 2),
        clusterNameList: self.state.clusterNameList,
        currentClusterName: self.state.nowCluster
      }
      const WrappedSecretFormModal = Form.create()(SecretFormModal);
      ReactDOM.render(<WrappedSecretFormModal initialValue={initialValue} config={config} />, div)
    }

    // we need initial value of form, so if secretData is null, we need to get it from backend
    const {name, nowCluster} = self.state

    appGetSecret(name, {cluster: nowCluster}).then(res => {
      self.setState({secretData: res})
      createSecret(res)
    }).catch(err => {
      let res = {}
      self.setState({secretData: res})
      createSecret(res)
    });
  }

  // 部署
  showDeployModal(record, canary) {
    let self = this
    let appname = self.state.name
    let nowCluster = self.state.nowCluster
    let title = ''
    if (canary) {
      title = "Deploy Canary"
    } else {
      title = "Deploy"
    }
    let div = document.createElement('div');
    document.body.appendChild(div);

    function destroy(...args: any[]) {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    function handler(data) {
      if (canary) {
        appDeployCanary(appname, data).then(res => {
          destroy();
          self.setState({canaryVisible: true})
          self.handleMsg(res, 'Deploy Canary');
        }).catch(err => {
          self.handleError(err);
        });
      } else {
        appDeploy(appname, data).then(res => {
          destroy();
          self.handleMsg(res, 'Deploy');
          // update version
          self.fetchDeploymentData(appname, nowCluster)
        }).catch(err => {
          self.handleError(err);
        });
      }
    }

    let config = {
      title: title,
      handler: handler,
      destroy: destroy
    }
    let initialValue = {
      tag: record.tag,
      replicas: 0,
      yamlNameList: self.state.yamlList.map(item => item.name),
      clusterNameList: self.state.clusterNameList,
      currentClusterName: self.state.nowCluster
    }

    const WrappedDeployModal = Form.create()(DeployModal);
    ReactDOM.render(<WrappedDeployModal config={config} initialValue={initialValue} />, div)
  }

  // 删除canary
  handleDeleteCanary() {
    let self = this

    confirm({
      title: 'Delete Canary',
      content: 'Are you sure to delete canary version?',
      onOk() {
        let { name, nowCluster } = self.state;
        appDeleteCanary({name: name, cluster: nowCluster}).then(res => {
          self.setState({canaryVisible: false})
          self.handleMsg(res, 'Delete Canary');
        }).catch(err => {
          self.handleError(err);
        });
      },
      onCancel() {},
    });
  }

  handleSetABTestingRules() {
    let self = this
    const {name, nowCluster} = this.state

    function handleABTestingSubmit(abtestingRulesValue, destroy) {
      appSetABTestingRules({
        name: name,
        cluster: nowCluster,
        rules: JSON.parse(abtestingRulesValue)
      }).then(res => {
        destroy()
        self.handleMsg(res, 'SET ABTesting Rules');
      }).catch(err => {
        self.handleError(err);
      });
    }

    function setRulesHelper(initialValue) {
      let config = {
        title: "Set A/B Testing Rules",
        mode: "json",
        initialValue: initialValue,
        handler: handleABTestingSubmit
      }
      self.showAceEditorModal(config)
    }

    appGetABTestingRules({
      name: name,
      cluster: nowCluster
    }).then(res => {
      let str = ""
      if (res) {
        str = JSON.stringify(res, null, 2)
      }
      setRulesHelper(str)
    }).catch(err => {
      let res = ""
      setRulesHelper(res)
    });
  }

  showDeleteAppConfirmModal() {
    let self = this
    let appname = self.state.name
    let title = "Delete App " + appname
    let div = document.createElement('div');
    document.body.appendChild(div);

    function destroy(...args: any[]) {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    function handler() {
      deleteApp(appname).then(res => {
        destroy()
        self.handleMsg(res, title)
      }).catch(err => {
        self.handleError(err)
      })
    }

    let config = {
      title: title,
      handler: handler,
      destroy: destroy
    }

    const WrappedDeleteAppConfirmModal = Form.create()(DeleteConfirmModal);
    ReactDOM.render(<WrappedDeleteAppConfirmModal config={config} expectValue={appname} />, div)
  }

  showAppYamlAddModal(record) {
    let self = this
    let appname = self.state.name
    let title = "Change App Yaml"
    if (! record.name) {
      title = "Add App Yaml"
      record = {}
    }
    let div = document.createElement('div');
    document.body.appendChild(div);

    function destroy(...args: any[]) {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    function handler(newRecord) {
      createOrUpdateAppYaml(appname, newRecord).then(res => {
        destroy()
        self.handleMsg(res, title)

        getAppYamlList(appname).then(res => {
          self.setState({
            yamlList: res
          })
        })
      }).catch(err => {
        self.handleError(err)
      })
    }

    let config = {
      title: title,
      handler: handler,
      destroy: destroy
    }

    const WrappedAppYamlAddModal = Form.create()(AppYamlAddModal);
    ReactDOM.render(<WrappedAppYamlAddModal config={config} record={record} />, div);
  }

  handleSetAppYaml(record) {
    let self = this
    const {name} = this.state

    function setAppYamlHelper(specs_text, destroy) {
      let data = {
        name: record.name,
        specs_text: specs_text,
        comment: record.comment
      }
      createOrUpdateAppYaml(name, data).then(res => {
        destroy()
        self.handleMsg(res, "Set App Yaml")

        getAppYamlList(name).then(res => {
          self.setState({
            yamlList: res
          })
        })
      }).catch(err => {
        self.handleError(err)
      })
    }

    let config = {
      title: "App Yaml",
      mode: "yaml",
      visible: true,
      initialValue: record.specs_text,
      handler: setAppYamlHelper
    }
    self.showAceEditorModal(config)
  }

  handleDeleteAppYaml(record) {
    let self = this
    const {name} = this.state

    confirm({
      title: 'Delete App Yaml',
      content: <div>Are you sure to delete app yaml(<strong>{record.name}</strong>)?</div>,
      onOk() {
        deleteAppYaml(name, record.name).then(res => {
          self.handleMsg(res, "delete app yaml")

          getAppYamlList(name).then(res => {
            that.setState({
              yamlList: res
            })
          })
        }).catch(err => {
          self.handleError(err)
        })
      },
      onCancel() {},
    });
  }

  // 更新
  handleRenew() {
    let self = this

    confirm({
      title: <div>Recreate Pods(cluster: <span style={{color:'red'}}>{self.state.nowCluster}</span>)</div>,
      content: <div>Are you sure to force kubernetes to recreate the pods of <strong>{self.state.name}</strong> app?</div>,
      onOk() {
        let {name, nowCluster} = self.state;
        appRenew({name: name, cluster: nowCluster}).then(res => {
          self.handleMsg(res, 'Renew');
        }).catch(err => {
          self.handleError(err);
        });
      },
      onCancel() {},
    });

  }

  // 伸缩
  handleScale() {
    this.setState({scaleVisible: false})
    let {name, scaleNum, nowCluster} = this.state;
    appScale({name: name, replicas: scaleNum, cluster: nowCluster}).then(res => {
      this.handleMsg(res, 'Scale');
    }).catch(err => {
      this.handleError(err);
    });
  }

  // 回滚
  handleRollback() {
    this.setState({rollbackVisible: false})
    let {name, nowCluster, rollbackRevisionNum} = this.state
    appRollback(name, {cluster: nowCluster, revision: rollbackRevisionNum}).then(res => {
      this.handleMsg(res, 'Rollback');
      this.fetchDeploymentData(name, nowCluster)
    }).catch(err => {
      this.handleError(err);
    });
  }

  // 显示信息
  handleMsg(data, action) {
    // 提示成功或失败
    let msg = JSON.parse(data);
    // let msg = {error: '1', msg: '1111111'}
    notification.destroy();

    if(msg.error === null) {
      notification.success({
        message: '成功！',
        description: `${action} Success!`
      });
    }else {
      // 报错信息以html格式显示
      const description = (
          <div>
          <p>{msg.msg}</p>
          </div>
      );
      notification.error({
        message: '失败！',
        description,
        duration: 0,
      });
    }
  }

  // 显示错误
  handleError(err) {
    let res = err.response;
    let errorMsg;
    let status;
    if(!res) {
      errorMsg = err.message;
      status = 500;
    }else {
      status = res.status;
      errorMsg = res.data;
      if (res.data.error) {
        errorMsg = res.data.error;
      }
    }
    // destroy existing notifications first
    notification.destroy();

    notification.error({
      message: '失败！',
      description: `${status}: ${errorMsg}`,
      duration: 0,
    });
  }

  render() {

    let self = this;
    const {name, canaryVisible, nowCluster} = this.state;

    let healthPercent = 100 * (self.state.readyReplicas / self.state.replicas);
    let healthStatus = healthPercent >= 100? 'success': 'exception';
    let healthFormat = healthPercent >= 100? 'Health': `${healthPercent}%`;
    let podColumns = [
      {
        title: 'NAME',
        dataIndex: 'name',
        width: '15%'
      },
      {
        title: 'READY',
        dataIndex: 'ready',
        width: '10%'
      },
      {
        title: 'STATUS',
        dataIndex: 'status',
        width: '10%'
      },
      {
        title: 'RESTARTS',
        dataIndex: 'restarts',
        width: '10%'
      },
      {
        title: 'AGE',
        dataIndex: 'age',
        width: '15%'
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        width: '15%'
      },
      {
        title: 'NODE',
        dataIndex: 'node',
        width: '15%'
      }
    ];

    let releaseColumns = [
      {
        title: 'tag',
        dataIndex: 'tag',
        width: '14%',
        render: tag => {
          let nowVersion = this.state.version === tag;
          if(nowVersion) {
            return (
                <span>{tag} <span style={{fontSize: '12px', color: 'red'}}>(当前版本)</span></span>
            )
          }else {
            return (
                <span>{tag}</span>
            )
          }
        }
      }, {
        title: 'created',
        dataIndex: 'created',
        width: '15%',
        defaultSortOrder: 'descend',
        sorter: (a, b) => {
          let c = new Date(a.created).getTime();
          let d = new Date(b.created).getTime();
          return c - d
        }
      }, {
        title: 'updated',
        dataIndex: 'updated',
        width: '15%',
      }, {
        title: 'image',
        dataIndex: 'image',
        width: '35%',
      }, {
        title: 'build_status',
        dataIndex: 'build_status',
        width: '10%',
        render(build_status) {
          return build_status.toString()
        }
      }, {
        title: 'Action',
        dataIndex: 'action',
        width: '16%',
        render(text, record) {
          const menu = (
              <Menu>
              {
                record.build_status ? '' : (
                    <Menu.Item key="0">
                    <div onClick={() => {
                      self.handleBuild.bind(self)(record.tag)}}>Build</div>
                    </Menu.Item>
                )
              }
              <Menu.Item key="1">
              <div onClick={() => { self.showDeployModal.bind(self)(record, false); }}>Deploy</div>
              </Menu.Item>
              <Menu.Item key="2">
              <div onClick={() => { self.showDeployModal.bind(self)(record, true); }}>Canary</div>
              </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item key="3">
                                <div onClick={() => {
                                    let config = {
                                        title: "Spec",
                                        mode: "yaml",
                                        visible: true,
                                        readOnly: true,
                                        initialValue: record.specs_text
                                    }
                                    self.setState({nowTag: record.tag})
                                    self.showAceEditorModal(config) }} >Spec Text</div>
                            </Menu.Item>
              </Menu>
                    );

                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <a className="ant-dropdown-link" href="#">
                                <div style={{width: '40px', textAlign: 'center'}}>
                                    <Icon type="ellipsis" className="btnIcon" />
                                </div>
                            </a>
                        </Dropdown>
                    )
                }
            }
        ]

        let yamlColumns = [
            {
                title: 'name',
                dataIndex: 'name',
                width: '14%',
            }, {
                title: 'created',
                dataIndex: 'created',
                width: '15%',
                defaultSortOrder: 'descend',
                sorter: (a, b) => {
                    let c = new Date(a.created).getTime();
                    let d = new Date(b.created).getTime();
                    return c - d
                }
            }, {
                title: 'updated',
                dataIndex: 'updated',
                width: '15%',
            }, {
                title: 'comment',
                dataIndex: 'comment',
                width: '35%',
            }, {
                title: 'Action',
                dataIndex: 'Action',
                width: '16%',
                render(text, record) {
                    return (
                         <span>
                            <a href="javascript:;" onClick={self.showAppYamlAddModal.bind(self, record)}>Edit</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={self.handleDeleteAppYaml.bind(self, record)}>Delete</a>
                        </span>
                    )
                }
            }
        ]
        return (
            <div>
                <Row type="flex" justify="space-between">
                 <Col span={12}>
                  <div className="detailInfo">
                    <div className="appHeader"><Icon type="setting" theme="filled" /> {name}</div>

                    <div className="appBody">
                        <div style={{marginBottom: '10px'}}>集群：
                        <Select value={nowCluster} style={{ width: 100}}
                                onChange={this.handleChangeCluster.bind(this)}>
                             { this.state.clusterNameList.map(name => <Option key={name}>{name}</Option>) }
                        </Select>
                        </div>
                        <p>
                         Canary: <span style={{color: 'blue'}}>{this.state.canaryVisible.toString()}</span><strong></strong>
                        </p>
                        <p>状态： {this.state.readyReplicas}个可用, 共计 {this.state.replicas}个 </p>
                        <div>
                            {this.state.canaryVisible &&
                                <span>
                                  <Divider type="vertical" />
                                  <Button onClick={this.handleDeleteCanary.bind(this)}>DeleteCanary</Button>
                                </span>
                            }
                          </div>
                          <p>Deployment:
                              <Button onClick={this.showAppDeployment.bind(this)}>Show</Button>
                          </p>
                          <p>Config: <Button onClick={this.handleConfigMap.bind(this)}>Set</Button>
                                 <Button onClick={this.showConfigMap.bind(this)}>Show</Button>
                          </p>
                          <p>Secret: <Button onClick={this.showSecretModal.bind(this)}>Set</Button>
                          </p>
                          {this.state.canaryVisible &&
                          <p>
                              ABTesting Rules: <Button onClick={this.handleSetABTestingRules.bind(this) }>Set</Button>
                          </p>
                          }
                          <Button type="primary"><Link to={`/logger?app=${name}`}>审计日志</Link></Button>
                          <Button onClick={this.handleRenew.bind(this)}>Renew</Button>
                          <Button onClick={() => {this.setState({scaleVisible: true})}}>Scale</Button>
                          <Button onClick={() => {this.setState({rollbackVisible: true})}}>Rollback</Button>
                          <Button type="danger" onClick={this.showDeleteAppConfirmModal.bind(this)}>Delete</Button>
                          </div>
                      </div>
              </Col>

              <Col span={11} style={{background: '#fff'}}>
                <div style={{padding: '10px'}}>
                  <h2>Health State:</h2>
                  <Progress type="circle" status={healthStatus} percent={healthPercent} format={()=>healthFormat} />
                </div>
              </Col>
                      </Row>
                    <div style={{ height: '20px' }}></div>

                    <Collapse bordered={false} defaultActiveKey={['1']}>
                        <Panel header={<h2>副本集</h2>} key="1">
                            <Table
                                columns={podColumns}
                                dataSource={this.state.podTableData}
                                rowKey="name"
                            />
                        </Panel>
                    </Collapse>

                    <div style={{ height: '20px' }}></div>

                    {this.state.canaryVisible && <Collapse bordered={false} defaultActiveKey={['1']}>
                        <Panel header={<h2>canary副本集</h2>} key="1">
                            <Table
                                columns={podColumns}
                                dataSource={this.state.canarypodTableData}
                                rowKey="name"
                                pagination={false}
                            />
                        </Panel>
                    </Collapse> }
                    {this.state.canaryVisible && <div style={{ height: '20px' }}></div> }

                    <Collapse bordered={false} defaultActiveKey={['1']}>
                        <Panel header={<h2>Yaml Template</h2>} key="1">
                            <div className="table-operations">
                              <Button type="primary" onClick={this.showAppYamlAddModal.bind(this, {})}>Add</Button>
                            </div>

                            <Table
                                columns={yamlColumns}
                                dataSource={this.state.yamlList}
                                rowKey="id"
                                pagination={false}
                            />
                        </Panel>
                    </Collapse>
                    <div style={{ height: '20px' }}></div>

                    <Collapse bordered={false} defaultActiveKey={['1']}>
                        <Panel header={<h2>版本信息</h2>} key="1">
                            <Table
                                columns={releaseColumns}
                                dataSource={this.state.releaseTableData}
                                rowKey="id"
                            />
                        </Panel>
                    </Collapse>

                    <Modal
                        title={this.state.infoModal.title}
                        visible={this.state.infoModal.visible}
                        onOk={this.hiddenInfoModal.bind(this)}
                        onCancel={this.hiddenInfoModal.bind(this)}
                        footer={[
                            <Button key="login" type="primary" onClick={this.hiddenInfoModal.bind(this)}>
                                确定
                            </Button>,
                        ]}
                    >
                        {this.state.infoModal.text}
                    {/*
                        <div dangerouslySetInnerHTML={{__html: this.state.infoModal.text}}></div>
                    */}
                    </Modal>

                    <Modal
                        title={<div>Scale {this.state.name} (cluster:<span style={{color:'red'}}>{this.state.nowCluster}</span>)</div>}
                        visible={this.state.scaleVisible}
                        onOk={this.handleScale.bind(this)}
                        onCancel={() => {this.setState({scaleVisible: false})}}
                    >
                        <p>cluster：<span style={{color:'red'}}>{this.state.nowCluster}</span></p>
                        <span>所需容器数量：</span>
                        <InputNumber min={1} max={10} defaultValue={1} onChange={num => {this.setState({scaleNum: num})}} />
                    </Modal>

                    <Modal
                        title={<div>Rollback {this.state.name} (cluster:<span style={{color:'red'}}>{this.state.nowCluster}</span>)</div>}
                        visible={this.state.rollbackVisible}
                        onOk={this.handleRollback.bind(this)}
                        onCancel={() => {this.setState({rollbackVisible: false})}}
                    >
                        <p>cluster：<span style={{color:'red'}}>{this.state.nowCluster}</span></p>
                        <span>revision：</span>
                        <InputNumber min={0} max={10} defaultValue={0} onChange={num => {this.setState({rollbackRevisionNum: num})}} />
                    </Modal>

                    <div id="example"></div>
            </div>
        )
    }
}

export default Form.create()(AppDetail);
