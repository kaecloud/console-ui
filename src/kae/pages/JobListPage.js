import React from 'react';
import ReactDOM from 'react-dom';
import {Icon, Divider, Collapse, Table, Button, Modal, Select, Form, Input, InputNumber, Menu, Dropdown, Checkbox, notification } from 'antd';
import {Link} from 'react-router-dom';

import brace from 'brace';
import AceEditor from 'react-ace';
import * as JobActions from '../models/actions/Jobs';
import * as JobApi from '../models/apis/Jobs';
import { getRequestFromProps, getPageRequests } from '../models/Utils';
import {getClusterNameList, processApiResult} from './Utils';
import CreateJobModal from '../components/CreateJobModal';
import {baseWsUrl} from '../config';

import 'brace/mode/yaml';
import 'brace/theme/xcode';

const { TextArea } = Input;
const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;

class JobList extends React.Component {
  constructor() {
    super();
    let self = this;
    this.state = {
      visible: false,
      logVisible: false,
      username: '',
      logMsg: '',
      showMsg: ''
    };
  }

  handleRestart(name) {
    let self = this;
    processApiResult(JobApi.restart(name), 'Restat Job')
      .then(val => {
        self.refreshList();
      }).catch(v => {});
  }

  handleDelete(name) {
    let self = this;
    processApiResult(JobApi.delete(name), 'Delete Job')
      .then(val => {
        self.refreshList();
      }).catch(v => {});
  }

  handleShowMessage(name) {
    let self = this;
    let showMsg = [];
    // console.log(name);
    this.setState({logVisible: true});

    const ws = new WebSocket(`${baseWsUrl}/api/v1/ws/job/${name}/log/events`);
    ws.onopen = function(evt) {
      // console.log("Connection open ...");
    };
    ws.onclose = function(evt) {
      console.log("Build finished")
    }
    ws.onerror = function(evt) {
      let msg = JSON.parse(evt.data).data

      notification.destroy()
      notification.error({
        message: '错误信息',
        description: `${msg}`,
        duration: 0,
      });
    }

    ws.onmessage = function(evt) {
      let msg = JSON.parse(evt.data)
      if(msg.error !== undefined) {
        msg = msg.error.split('\n');
        let arr = [];
        msg.forEach((d, index) => {
          arr.push(<p key={index}>{d}</p>)
        })
        const errMsg = (
            <div style={{color: 'red'}}>
            {arr}
          </div>
        )
        self.setState({
          logMsg: errMsg
        })
      }else {
        msg = msg.data;
        showMsg.push(<p key={msg}>{msg}</p>)
        self.setState({
          showMsg: showMsg
        })
      }
    }
  }

  getJobList() {
    const { requests, isFetching, error } =
          getPageRequests(this.props, [
            'LIST_JOB_REQUEST', 'GET_CURRENT_USER_REQUEST'
          ]);
    let [jobsReq, userReq] = requests;
    let jobList = jobsReq.data? jobsReq.data: [],
        username = userReq.data? userReq.data.nickname: 'unknown';

    jobList.map(d => {
      d.user = username;
    });
    return jobList;
  }

  handleChangeCluster(newCluster) {
    this.setState({
      nowCluster: newCluster
    });
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList() {
    const {dispatch} = this.props;
    dispatch(JobActions.list());
  }

  showCreateJobModal() {
    let self = this;

    let div = document.createElement('div');
    document.body.appendChild(div);

    function destroy(...args: any[]) {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }
    function handler(job) {
      processApiResult(JobApi.create(job), 'Create Job')
        .then(data => {
            destroy();
            self.refreshList();
        }).catch(e => {});
    }
    let config = {
      isForm: true,
      destroy: destroy,
      hander: handler
    };

    ReactDOM.render(<CreateJobModal config={config} />, div);
  }

  render() {
    let jobList = this.getJobList(),
        clusterNameList = getClusterNameList(this.props),
        nowCluster = this.state.nowCluster;
    if (! nowCluster) {
      if (clusterNameList.length > 0) {
        nowCluster = clusterNameList[0];
      }
    }

      const { getFieldDecorator } = this.props.form;

      let jobListcolumns = [
          {
              title: 'name',
              dataIndex: 'name'
          }, {
              title: 'status',
              dataIndex: 'status',
              filters: [{
                  text: 'Hidden',
                  value: 'Hidden'
              }, {
                  text: 'Complete',
                  value: 'Complete'
              }, {
                  text: 'Fav',
                  value: 'Fav'
              }, {
                  text: 'Running',
                  value: 'Running'
              }],
              onFilter: (value, record) => record.status.indexOf(value) === 0,
          }, {
              title: 'created',
              dataIndex: 'created',
              defaultSortOrder: 'descend',
              sorter: (a, b) => {
                  let c = new Date(a.created).getTime();
                  let d = new Date(b.created).getTime();
                  return c - d
              }
          }, {
              title: 'updated',
              dataIndex: 'updated',
          }, {
              title: 'user',
              dataIndex: 'user',
          }, {
              title: 'log',
              dataIndex: 'log',
              render(text, record) {
                  return (
                      <span style={{color: '#347EFF', cursor: 'pointer'}} onClick={() => {self.handleShowMessage(record.name)}}>log</span>
                  )
              }
          }, {
              title: 'Action',
              dataIndex: 'action',
              render(text, record) {
                  return (
                      <span>
                      <a href="javascript:;" onClick={() => {self.handleRestart(record.name)}}>Restart</a>
                      <Divider type="vertical" />
                      <a href="javascript:;" onClick={() => {self.handleDelete(record.name)}}>Delete</a>
                      </span>
                  );
              }
          }
      ];
      return (
          <div className="jobList">
              <Collapse bordered={false} defaultActiveKey={['1']}>
                  <Panel header={<h2>job列表</h2>} key="1">
          <Button type="primary" style={{zIndex: '9', marginBottom: '20px'}} onClick={this.showCreateJobModal.bind(this)}>Create Job</Button>
                      <Icon type="reload" className="reload" onClick={this.refreshList.bind(this)}/>

                      <Divider type="vertical" />

                      Cluster: <Select value={nowCluster} style={{ width: 100}}
                              onChange={this.handleChangeCluster.bind(this)}>
                           { clusterNameList.map(name => <Option key={name}>{name}</Option>) }
                      </Select>
                      <Table
                          columns={jobListcolumns}
                          dataSource={jobList}
                          rowKey="name"
                      />

                  </Panel>
              </Collapse>
              <Modal
                  title="logger"
                  visible={this.state.logVisible}
                  onCancel={() => {this.setState({logVisible: false, showMsg: '', logMsg: ''})}}
                  footer={null}
              >
                  <div>{this.state.showMsg}</div>
                  <div>{this.state.logMsg}</div>
              </Modal>
          </div>
      )
  }
}

export default Form.create()(JobList);
