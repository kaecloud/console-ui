/*eslint-disable no-script-url*/
/*eslint-disable jsx-a11y/anchor-is-valid*/

import React from 'react';
import ReactDOM from 'react-dom';

import {
  Alert, Icon, Divider, Collapse, Table, Button, Modal, Row, Col, Select,
  InputNumber, Menu, Dropdown,
  Progress, Tooltip
} from 'antd';
import { Link } from 'react-router-dom';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

import AceEditorModal from '../components/AceEditorModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AppYamlAddModal from '../components/AppYamlAddModal';
import DeployModal from '../components/DeployModal';
import {showDynamicModal, showInfoModal } from '../components/DynamicModal';

import * as AppApi from '../models/apis/Apps';
import {getPageRequests, getRequestFromProps} from '../models/Utils';
import * as AppActions from '../models/actions/Apps';
import AppPodsWatcher from '../models/AppDetailPageWs';
import {setArg, processApiResult, getNowCluster, getClusterNameList} from '../Utils';
import {baseWsUrl} from '../config';

const Panel = Collapse.Panel;
const Option = Select.Option;
const confirm = Modal.confirm;

const spanStyle = {
  padding: '0 4px',
  marginRight: '4px',
  background: '#eee',
  border: '1px solid #ccc',
  borderRadius: '6px'
};


class AppDetail extends React.Component {

  constructor() {
    super();

    this.alreadyInitialized = false;
    this.state = this.getInitialState();
  }

  componentWillMount() {
  }

  refreshIfNedded() {
    let nowCluster = this.getNowCluster();

    if (nowCluster) {
      if (this.alreadyInitialized === false ) {
        this.alreadyInitialized = true;
        this.changeCluster(nowCluster, false);
      }
    }
  }

  refreshPage(nowCluster) {
    let appName = this.getAppName();

    const {dispatch} = this.props;

    if (nowCluster) {
      dispatch(AppActions.getCanaryInfo(appName, nowCluster));
      dispatch(AppActions.getDeployment(appName, nowCluster));
    }
    dispatch(AppActions.getReleases(appName));
    dispatch(AppActions.listAppYaml(appName));
  }

  componentDidMount() {
    this.refreshIfNedded();
  }

  componentWillUnmount() {
    AppPodsWatcher.close();
  }

  componentWillReceiveProps(nextProps) {
    this.refreshIfNedded();
  }

  getInitialState() {
    return {
      infoModal: {
        text: '',
        title: '',
        visible: false
      },
      scaleNum: 1,
      rollbackRevisionNum: 0,
      scaleVisible: false,
      rollbackVisible: false
    };
  }

  changeCluster = (newCluster, dispatchAction=true) => {
    const appName = this.getAppName();
    setArg('cluster', newCluster);

    AppPodsWatcher.reload(appName, newCluster);
    this.refreshPage(newCluster);

    if (dispatchAction) {
      const {dispatch} = this.props;

      dispatch(AppActions.setCurrentCluster(newCluster));
    }
  }

  hiddenInfoModal() {
    this.setState({
      infoModal: {
        visible: false
      }
    });
  }

  showAceEditorModal = (config) => {
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

  showAppDeployment = () => {
    let appName = this.getAppName();

    const request = getRequestFromProps(this.props, 'GET_APP_DEPLOYMENT_REQUEST');
    let dp = null;
    if (request.statusCode === 200) {
      dp = request.data;
    }

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

    let cfg = {};
    cfg.visible = true;
    cfg.title = "Deployment";
    cfg.text = (
      <div>
        <p>appName: {appName} </p>
        <p>命名空间：{namespace}</p>
        <p>副本数量：{replicas}</p>
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
    showInfoModal(cfg, false);
  }

  // 构建
  handleBuild(tag) {
    let self = this;
    let appName = this.getAppName();
    const {dispatch} = this.props;

    confirm({
      title: 'Build',
      content: `Are you sure to build image for app ${appName} release ${tag}?`,
      onOk() {
        const ws = new WebSocket(`${baseWsUrl}/api/v1/ws/app/${appName}/build`);
        ws.onopen = function(evt) {
          ws.send(`{"tag": "${tag}"}`);
        };
        ws.onclose = function(evt) {
          // update release data
          dispatch(AppActions.getReleases(appName));
          console.log("Build finished");
        };

        let infoModal = {
          isHtml: true,
          visible: true,
          title: "Build Output",
          text: ''
        };

        self.setState({infoModal: infoModal});
        let text = "";
        let phase = null;
        ws.onmessage = function(evt) {
          let data = JSON.parse(evt.data);
          if (! data.success) {
            text += `<p key=${data.error}>${data.error}</p>`;
          } else {
            if (phase !== data['phase']) {
              text += `<p>***** PHASE ${data.phase}</p>`;
              phase = data['phase'];
            }
            if (data.phase.toLowerCase() === "pushing") {
              let raw_data = data['raw_data'];
              if (raw_data.id && raw_data.status) {
                text += `<p>${raw_data.id}: ${raw_data.status}</p>`;
              } else if (raw_data.digest) {
                text += `<p>${raw_data.status}: digest: ${raw_data.digest} size: ${raw_data.size}</p>`;
              } else {
                text += `<p>${JSON.stringify(data)}</p>`;
              }
            } else {
              text += `<p>${data.msg}</p>`;
            }
          }
          infoModal.text = text;
          self.setState({infoModal: infoModal});
        };
      },
      onCancel() {}
    });
  }

  // 部署
  showDeployModal(record, canary) {
    console.log(this, record, canary);
    let self = this;
    let appName = self.getAppName(),
        nowCluster = self.getNowCluster(),
        clusterNameList = self.getClusterNameList(),
        yamlList = self.getYamlList(),
        {dispatch} = self.props;
    let title = 'Deploy';
    if (canary) {
      title = "Deploy Canary";
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
        processApiResult(AppApi.deployCanary(appName, data), 'DeployCanary')
          .then(data => {
            destroy();
          }).catch(v => {});
      } else {
        processApiResult(AppApi.deploy(appName, data), 'Deploy')
          .then( data => {
            destroy();
            dispatch(AppActions.getDeployment(appName, nowCluster));
          }).catch(v => {});
      }
    }

    let config = {
      title: title,
      handler: handler,
      destroy: destroy
    };
    let initialValue = {
      tag: record.tag,
      replicas: 0,
      yamlNameList: yamlList.map(item => item.name),
      clusterNameList: clusterNameList,
      currentClusterName: nowCluster
    };

    ReactDOM.render(<DeployModal config={config} initialValue={initialValue} />, div);
  }

  // 删除canary
  handleDeleteCanary = () => {
    let self = this,
        appName = this.getAppName(),
        nowCluster = this.getNowCluster(),
        title = 'Delete Canary',
        {dispatch} = self.props;

    confirm({
      title: 'Delete Canary',
      content: 'Are you sure to delete canary version?',
      onOk() {
        processApiResult(AppApi.deleteCanary(appName, nowCluster), title)
          .then( data => {
            dispatch(AppActions.getCanaryInfo(appName, nowCluster));
          }).catch(v => {});
      },
      onCancel() {}
    });
  }

  showDeleteAppConfirmModal = () => {
    let self = this;
    let appName = this.getAppName();
    let title = "Delete App " + appName;
    let div = document.createElement('div');
    document.body.appendChild(div);

    function destroy(...args: any[]) {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    function handler() {
      processApiResult(AppApi.remove(appName), title)
        .then(data => {
          destroy();
          // redict to app list page
          self.props.history.push('/apps');
        }).catch(e => {});
    }

    let config = {
      title: title,
      handler: handler,
      destroy: destroy
    };

    ReactDOM.render(<DeleteConfirmModal config={config} expectValue={appName} />, div);
  }

  showAppYamlAddModal(record) {
    let appName = this.getAppName();
    const {dispatch} = this.props;

    let oldName = record.name,
        title = "Change App Yaml";
    if (! oldName) {
      title = "Add App Yaml";
      record = {};
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
      if (oldName) {
        processApiResult(AppApi.updateAppYaml(appName, oldName, newRecord), title)
          .then(data => {
            destroy();
            dispatch(AppActions.listAppYaml(appName));
          }).catch(e => {});
      } else {
        processApiResult(AppApi.createAppYaml(appName, newRecord), title)
          .then(data => {
            destroy();
            dispatch(AppActions.listAppYaml(appName));
          }).catch(e => {});
      }
    }

    let config = {
      title: title,
      handler: handler,
      destroy: destroy
    };

    ReactDOM.render(<AppYamlAddModal config={config} record={record} />, div);
  }

  handleDeleteAppYaml(record) {
    let appName = this.getAppName(),
        {dispatch} = this.props,
        title = 'Delete App Yaml';

    confirm({
      title: 'Delete App Yaml',
      content: <div>Are you sure to delete app yaml(<strong>{record.name}</strong>)?</div>,
      onOk() {
        processApiResult(AppApi.deleteAppYaml(appName, record.name), title)
          .then(data => {
            dispatch(AppActions.listAppYaml(appName));
          }).catch(e => {});
      },
      onCancel() {}
    });
  }

  handleUndeploy = () => {
    let appName = this.getAppName(),
        clusterNameList = this.getClusterNameList(),
        nowCluster= this.getNowCluster();

    function handler(destroy) {
      processApiResult(AppApi.undeploy(appName, nowCluster), "undeploy")
        .then(data => {
          destroy();
        }).catch(e => {});
    }

    function handleChange(newCluster) {
      nowCluster = newCluster;
    }
    let config = {
      title: "Undeploy",
      children: (
        <div>
          <Alert
        message={`该操作会删除 ${appName} 在指定集群上的部署，这是一个危险操作，请仔细确认集群是否正确`}
        type="warning"
          />
          <div
        style={{marginTop: '15px'}}
          >
      cluster: <Select defaultValue={nowCluster} style={{ width: 100}}
      onChange={handleChange}>
        { clusterNameList.map(name => <Option key={name}>{name}</Option>) }
                 </Select>
          </div>
      </div>),
      handler: handler
    };
    showDynamicModal(config);
  }

  // 更新
  handleRenew = () => {
    let appName = this.getAppName(),
        title = `Renew App ${appName}`,
        nowCluster = this.getNowCluster(),
        {dispatch} = this.props;

    confirm({
      title: <div>Recreate Pods(cluster: <span style={{color:'red'}}>{nowCluster}</span>)</div>,
      content: <div>Are you sure to force kubernetes to recreate the pods of <strong>{appName}</strong> app?</div>,
      onOk() {
        processApiResult(AppApi.renew(appName, nowCluster), title)
          .then(data => {
            dispatch(AppActions.getDeployment(appName, nowCluster));
          }).catch(e => {});
      },
      onCancel() {}
    });

  }

  // 伸缩
  handleScale = () => {
    this.setState({scaleVisible: false});
    let {scaleNum} = this.state;
    let appName = this.getAppName(),
        nowCluster = this.getNowCluster(),
        {dispatch} = this.props,
        title = 'Scale App';
    processApiResult(AppApi.scale(appName, nowCluster, scaleNum), title)
      .then(data => {
        dispatch(AppActions.getDeployment(appName, nowCluster));
      }).catch(e => {});
  }

  // 回滚
  handleRollback = () => {
    this.setState({rollbackVisible: false});
    let {rollbackRevisionNum} = this.state;
    let appName = this.getAppName(),
        nowCluster = this.getNowCluster(),
        title = 'Rollback App',
        {dispatch} = this.props;
    processApiResult(AppApi.rollback(appName, nowCluster, rollbackRevisionNum), title)
      .then(data => {
        dispatch(AppActions.getDeployment(appName, nowCluster));
      }).catch(e => {});
  }

  showAppPodLog(record) {
    let appName = this.getAppName(),
        nowCluster= this.getNowCluster(),
        podName = record.name,
        containers = record.container_names,
        selectedContainer = record.container_names[0];

    function handler(destroy) {
      processApiResult(AppApi.getPodLog(appName, podName, nowCluster, selectedContainer), "get pod log")
        .then(data => {
          destroy();
          let config = {
            title: "Spec",
            visible: true,
            text: data.data
          };
          showInfoModal(config, true);
        }).catch(e => {});
    }

    // only show select modal when there exist multiple containers
    if (containers.length === 1) {
      handler(()=>{});
    } else {
      let config = {
        title: "select container",
        children: (
            <div>
            container: <Select defaultValue={containers[0]} style={{ width: 100}}
          onChange={v => {selectedContainer=v;}}>
            { containers.map(name => <Option key={name}>{name}</Option>) }
          </Select>
            </div>
        ),
        handler: handler
      };
      showDynamicModal(config);
    }
  }

  showAppPodStatus(record) {
    let text = JSON.stringify(record.pod.status, undefined, 2);
    let config = {
      title: "Pod status",
      width: 700,
      visible: true,
      text: (
          <SyntaxHighlighter language="yaml" style={docco}>
          {text}
        </SyntaxHighlighter>
      )
    };
    showInfoModal(config, false);
  }

  getAppName(props = this.props) {
    return props.match.params.appName;
  }

  getNowCluster() {
    return getNowCluster(this.props);
  }

  getClusterNameList() {
    return getClusterNameList(this.props);
  }

  getDeployment() {
    const request = getRequestFromProps(this.props, 'GET_APP_DEPLOYMENT_REQUEST');
    let dp = null;
    if (request.statusCode === 200) {
      dp = request.data;
    }
    return dp;
  }

  getYamlList() {
    const request = getRequestFromProps(this.props, 'LIST_APP_YAML_REQUEST');
    let yamlList = [];
    if (request.statusCode === 200) {
      yamlList = request.data;
    }
    return yamlList;
  }

  getReleases() {
    const request = getRequestFromProps(this.props, 'GET_APP_RELEASES_REQUEST');
    let releases = [];
    if (request.statusCode === 200) {
      releases = request.data;
    }
    return releases;
  }

  renderPods() {
    const { requests, error } =
          getPageRequests(this.props, [
            'APP_PODS_EVENT', 'APP_CANARY_PODS_EVENT'
          ]);
      if (error !== '') {
          console.error(error);
      }
    let [podsReq, canaryPodsReq] = requests;

    let self = this,
        appName = this.getAppName(),
        nowCluster = getNowCluster(this.props),
        podTableData = podsReq.data? podsReq.data: [],
        canaryPodTableData = canaryPodsReq.data? canaryPodsReq.data: [],
        hasCanary = canaryPodTableData.length > 0;

    let podColumns = [
      {
        title: 'NAME',
        dataIndex: 'name',
        width: '25%'
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
        width: '10%'
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        width: '10%'
      },
      {
        title: 'NODE',
        dataIndex: 'node',
        width: '10%'
      },
      {
        title: 'ACTION',
        dataIndex: 'action',
        width: '15%',
        render(text, record) {
          return (
              <span>
              {/*
              <Link to={`/apps/${appName}/pod/${record.name}/log?cluster=${nowCluster}`}>log</Link>
               */}
              <a href="javascript:;" onClick={self.showAppPodLog.bind(self, record)}>log</a>
              <Divider type="vertical" />
              <a href="javascript:;" onClick={self.showAppPodStatus.bind(self, record)}>status</a>
              <Divider type="vertical" />
              <Link to={`/apps/${appName}/cluster/${nowCluster}/pod/${record.name}/entry`}>enter</Link>
              </span>
          );
        }
      }
    ];

    return (
      <div>
        <Collapse bordered={false} defaultActiveKey={['1']}>
            <Panel header={<h2>副本集</h2>} key="1">
                <Table
                    columns={podColumns}
                    dataSource={podTableData}
                    rowKey="name"
                    size='small'
                />
            </Panel>
        </Collapse>

        {hasCanary && <Collapse bordered={false} defaultActiveKey={['1']}>
            <Panel header={<h2>canary副本集</h2>} key="1">
                <Table
                    columns={podColumns}
                    dataSource={canaryPodTableData}
                    rowKey="name"
                    pagination={false}
                    size='small'
                />
            </Panel>
        </Collapse>
         }
</div>
    );
  };

  render() {
    const { requests, error} =
          getPageRequests(this.props, [
            'GET_APP_DEPLOYMENT_REQUEST', 'GET_APP_RELEASES_REQUEST',
            'APP_PODS_EVENT', 'APP_CANARY_PODS_EVENT'
          ]);
    if (error !== '') {
      console.error(error);
    }
    let [dpReq, releasesReq, podsReq, canaryPodsReq] = requests;

    let self = this,
        appName = this.getAppName(),
        dp = dpReq.data,
        releaseTableData = releasesReq.data? releasesReq.data: [],
        podsData = podsReq.data? podsReq.data: [],
        canaryPodsData = canaryPodsReq.data? canaryPodsReq.data: [],
        hasCanary = canaryPodsData.length > 0,
        clusterNameList = this.getClusterNameList(),
        nowCluster = this.getNowCluster();
    let replicas = dp? dp.spec.replicas: 0,
        readyReplicas = 0,
        version = dp? dp.metadata.annotations.release_tag: "";

    // calculate ready pods
    for (const val of podsData.values() ) {
      if (val.ready_count === val.ready_total) {
        readyReplicas++;
      }
    }


    let healthPercent = 100 * (readyReplicas / replicas);
    let healthStatus = healthPercent >= 100? 'success': 'exception';
    let healthFormat = healthPercent >= 100? 'Health': `${healthPercent}%`;

    let releaseColumns = [
      {
        title: 'tag',
        dataIndex: 'tag',
        width: '14%',
        render: tag => {
          let nowVersion = version === tag;
          if(nowVersion) {
            return (
                <span>{tag} <span style={{fontSize: '12px', color: 'red'}}>(当前版本)</span></span>
            );
          }else {
            return (
                <span>{tag}</span>
            );
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
          return c - d;
        }
      }, {
        title: 'updated',
        dataIndex: 'updated',
        width: '15%'
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
                    <div onClick={self.handleBuild.bind(self, record.tag)}>Build</div>
                    </Menu.Item>
                )
              }
              <Menu.Item key="1">
              <div onClick={self.showDeployModal.bind(self, record, false)}>Deploy</div>
              </Menu.Item>
              <Menu.Item key="2">
              <div onClick={self.showDeployModal.bind(self, record, true)}>Canary</div>
              </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3">
                    <div onClick={() => {
                        let config = {
                            title: "Spec",
                            visible: true,
                            text: (
                              <SyntaxHighlighter language="yaml" style={docco}>
                                {record.specs_text}
                              </SyntaxHighlighter>
                            )
                        };
                        showInfoModal(config, false);
                     }}
                     >Spec Text</div>
                </Menu.Item>
              </Menu>
                    );

                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <a className="ant-dropdown-link" href="javascript:;">
                                <div style={{width: '40px', textAlign: 'center'}}>
                                    <Icon type="ellipsis" className="btnIcon" />
                                </div>
                            </a>
                        </Dropdown>
                    )
                }
            }
        ]

        return (
            <div>
                <Row type="flex"  gutter={5} justify="space-between">
                 <Col span={24}>
                  <div className="detailInfo">
                    <div className="appHeader"><Icon type="deployment-unit" /> {appName}</div>

                    <div className="appBody">
                        <div style={{marginBottom: '10px'}}>集群：
                        <Select value={nowCluster} style={{ width: 100}}
                                onChange={self.changeCluster}>
                             { clusterNameList.map(name => <Option key={name}>{name}</Option>) }
                        </Select>
                        </div>
                        <div>
                         <div style={{float: 'left'}}>
                        <p>状态： 当前版本为<strong>{version}</strong>，共计<strong>{replicas}</strong>个副本，其中<strong>{readyReplicas}</strong>个可用 </p>
</div>
                      <div style={{ width: 100, float: 'left', marginLeft: '10px'}}>
                          <Progress size="small" status={healthStatus} percent={healthPercent} format={()=>healthFormat} />
                        </div>
                      </div>
                        <div style={{marginBottom: '10px', clear: 'both'}}>
                         Canary: <span style={{color: 'blue'}}>{hasCanary.toString()}</span><strong></strong>
                            {hasCanary &&
                                <span>
                                  <Divider type="vertical" />
                                  <Button onClick={self.handleDeleteCanary}>DeleteCanary</Button>
              </span>
                            }
                        </div>
                          <p>
                              <Button onClick={this.showAppDeployment}>Deployment</Button>
                              <Button><Link to={`/apps/${appName}/configmap`}>ConfigMap</Link></Button>
                              <Button><Link to={`/apps/${appName}/secret`}>Secret</Link></Button>
                          {hasCanary &&
                           <Button><Link to={`/apps/${appName}/abtesting`}>ABTesting</Link></Button>
                          }
                          </p>
                          <Button type="primary"><Link to={`/apps/${appName}/audit_logs`}>审计日志</Link></Button>
                          <Button onClick={self.handleRenew}>Renew</Button>
                          <Button onClick={() => {self.setState({scaleVisible: true})}}>Scale</Button>
                          <Button onClick={() => {self.setState({rollbackVisible: true})}}>Rollback</Button>
                          <Button type="danger" onClick={self.showDeleteAppConfirmModal}>Delete</Button>
              <Button type="danger" onClick={self.handleUndeploy}>Undeploy</Button>
                          </div>
                      </div>
              </Col>
{/*
              <Col span={12} style={{background: '#fff'}}>
                <div style={{padding: '10px'}}>
                  <h2>Health State:</h2>
                  <Progress type="circle" status={healthStatus} percent={healthPercent} format={()=>healthFormat} />
                </div>
              </Col>
*/}
                      </Row>
                    <div style={{ height: '20px' }}></div>

          {
            this.renderPods()
          }
          {
            this.renderYamlList()
          }
                    <Collapse bordered={false} defaultActiveKey={['1']}>
                        <Panel header={<h2>版本信息</h2>} key="1">
                            <Table
                                columns={releaseColumns}
                                dataSource={releaseTableData}
                                rowKey="id"
                                size='small'
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
                        <div dangerouslySetInnerHTML={{__html: this.state.infoModal.text}}></div>
                    </Modal>

                    <Modal
                        title={<div>Scale {appName} (cluster:<span style={{color:'red'}}>{nowCluster}</span>)</div>}
                        visible={this.state.scaleVisible}
                        onOk={this.handleScale}
                        onCancel={() => {this.setState({scaleVisible: false})}}
                    >
                        <p>cluster：<span style={{color:'red'}}>{nowCluster}</span></p>
                        <span>所需容器数量：</span>
                        <InputNumber min={1} max={10} defaultValue={1} onChange={num => {this.setState({scaleNum: num})}} />
                    </Modal>

                    <Modal
                        title={<div>Rollback {appName} (cluster:<span style={{color:'red'}}>{nowCluster}</span>)</div>}
                        visible={this.state.rollbackVisible}
                        onOk={this.handleRollback}
                        onCancel={() => {this.setState({rollbackVisible: false})}}
                    >
                        <p>cluster：<span style={{color:'red'}}>{nowCluster}</span></p>
                        <span>revision：</span>
                        <InputNumber min={0} max={10} defaultValue={0} onChange={num => {this.setState({rollbackRevisionNum: num})}} />
                    </Modal>

                    <div id="example"></div>
            </div>
        )
    }

  renderYamlList() {
    let self = this,
        yamlList = this.getYamlList(),
        yamlColumns = [
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
              return c - d;
            }
          }, {
            title: 'updated',
            dataIndex: 'updated',
            width: '15%',
          }, {
            title: 'comment',
            dataIndex: 'comment',
            width: '35%',
            render: (text) => (
                <Tooltip title={text}>
                  <span className=".col-ellipsis">{text}</span>
                </Tooltip>
            ),
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
              );
            }
          }
        ];
    return (
      <Collapse bordered={false} defaultActiveKey={['1']}>
        <Panel header={<h2>Yaml Template</h2>} key="1">
          <div className="table-operations">
            <Button type="primary" onClick={this.showAppYamlAddModal.bind(this, {})}>Add</Button>
          </div>

          <Table
            columns={yamlColumns}
            dataSource={yamlList}
            rowKey="id"
            pagination={false}
            size='small'
          />
        </Panel>
      </Collapse>
    );
  }

}

export default AppDetail;
