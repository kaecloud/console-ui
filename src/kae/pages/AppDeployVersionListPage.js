import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Table, Tooltip, Breadcrumb, Modal} from 'antd';

import { getRequestFromProps } from '../models/Utils';
import {getNowCluster, processApiResult} from '../Utils';
import * as AppActions from '../models/actions/Apps';
import * as AppApi from '../models/apis/Apps';
import {showInfoModal } from '../components/DynamicModal';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

const confirm = Modal.confirm;

class AppDeployVersionList extends React.Component {
  constructor() {
    super();
    this.state = {
      searchText: ''
    };
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList() {
    let appName = this.getAppName();
    const {dispatch} = this.props;
    dispatch(AppActions.listAppDeployVersion(appName));
  }
  handleSearch(selectedKeys, confirm) {
    return () => {
      confirm();
      this.setState({ searchText: selectedKeys[0] });
    };

  }
  handleReset(clearFilters){
    return () => {
      clearFilters();
      this.setState({ searchText: '' });
    };
  }

  getAppName(props = this.props) {
    return props.match.params.appName;
  }

  rollbackApp(record) {
    let appName = this.getAppName(),
        nowCluster = getNowCluster();
    const {dispatch} = this.props;

    confirm({
      title: 'Rollback App',
      content: 'Are you sure to rollback app?',
      onOk() {
        processApiResult(AppApi.rollback(appName, nowCluster, 0, record.id), "rollback")
          .then(data => {
            dispatch(AppActions.getDeployment(appName, nowCluster));
          }).catch(e => {});
      },
      onCancel() {}
    });
  }

  showConfig(record) {
    let appName = this.getAppName();

    processApiResult(AppApi.getAppConfig(appName, record.config_id), "getAppConfig")
      .then(data => {

        let contentJsx = [];
        Object.entries(data.content).forEach(([key, value]) => {
          contentJsx.push(
              <div key={key}>
              <h3>{key}</h3>
                <SyntaxHighlighter  style={docco}>
                  {value}
                </SyntaxHighlighter>
               </div>);
        });
        let config = {
          title: "Config",
          width: 700,
          visible: true,
          text: (
            <div>
            {contentJsx}
            </div>
          )
        };
        showInfoModal(config, false);
      }).catch(e => {});
  }

  showSpec(record) {
    let config = {
      title: "Spec",
      width: 700,
      visible: true,
      text: (
          <SyntaxHighlighter  style={docco}>
          {record.specs_text}
        </SyntaxHighlighter>
      )
    };
    showInfoModal(config, false);
  }

  render() {
    let nowCluster = getNowCluster(this.props),
        appName = this.getAppName(),
        self = this;

    const columns = [
      {
        title: 'Tag',
        dataIndex: 'tag'
      }, {
        title: 'Cluster',
        dataIndex: 'cluster'
      }, {
        title: 'Config',
        dataIndex: 'config_id',
        render(text, record) {
          if (! record.config_id) {
            return ("null");
          }
          return (
              <span>
                <a onClick={self.showConfig.bind(self, record)}>show</a>
              </span>
          );
        }
      }, {
        title: 'created',
        dataIndex: 'created',
        defaultSortOrder: 'descend',
        sorter: (a, b) => {
          let c = new Date(a.created).getTime();
          let d = new Date(b.created).getTime();
          return c - d;
        }
      }, {
        title: "Spec",
        dataIndex: "specs_text",
        ellipsis: {
          showTitle: false,
        },
        render(text, record) {
          return (
              <span>
              <a onClick={self.showSpec.bind(self, record)}>show</a>
              </span>
          );
        }
      }, {
        title: 'Action',
        dataIndex: 'Action',
        width: '16%',
        render(text, record) {
          return (
              <span>
              <a onClick={self.rollbackApp.bind(self, record)}>rollback</a>
              </span>
          );
        }
      }
    ];

    const request = getRequestFromProps(this.props, 'LIST_APP_DEPLOY_VERSION_REQUEST');
    let data = [];
    if (request.statusCode === 200) {
      data = request.data;
    }
    return (
      <div className="appList mainContent">
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>
            <Link to={`/`}>Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/apps/${appName}/detail?cluster=${nowCluster}`}>App</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>DeployVersion</Breadcrumb.Item>
        </Breadcrumb>

        <h2>App Deploy Version</h2>
        <Table
          columns={columns}
          dataSource={data}
          size='small'
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </div>
        );
    }
}

export default withRouter(AppDeployVersionList);
