import React from 'react';
import {Link} from 'react-router-dom';
import { Collapse, Table, Icon, Layout, Breadcrumb } from 'antd';
import * as AppActions from '../models/actions/Apps';
import { getRequestFromProps } from '../models/Utils';
import {getNowCluster} from './Utils';

const Panel = Collapse.Panel;
const {Content} = Layout;

const columns = [
  {
    title: '应用',
    dataIndex: 'appname',
    width: '10%'
  }, {
    title: '用户',
    dataIndex: 'username',
    width: '10%'
  }, {
    title: 'TAG',
    dataIndex: 'tag',
    width: '10%'
  }, {
    title: 'CLUSTER',
    dataIndex: 'cluster',
    width: '10%'
  }, {
    title: 'TIME',
    dataIndex: 'created',
    key: 'created',
    width: '15%',
    defaultSortOrder: 'descend',
    sorter: (a, b) => {
      let c = new Date(a.created).getTime();
      let d = new Date(b.created).getTime();
      return c - d;
    }
  }, {
    title: '操作',
    dataIndex: 'action',
    width: '15%'

  }, {
    title: '修改内容',
    dataIndex: 'content',
    render: content => {
      return (
          <span>{content ? content : '无'}</span>
      );
    }
  }
];

class AppAuditLog extends React.Component {

  constructor() {
    super();
  }

  componentDidMount() {
    this.refreshLogs();
  }

  refreshLogs() {
    const name = this.getAppName();
    const {dispatch} = this.props;
    dispatch(AppActions.getAuditLogs(name));
  }

  render() {
    const request = getRequestFromProps(this.props, 'GET_APP_LOGS_REQUEST');
    let data = [],
        appName = this.props.match.params.appName,
        cluster = getNowCluster(this.props);
    if (request.statusCode === 200) {
      data = request.data;
    }

    return (
      <Content>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>
            <Link to={`/`}>Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/apps/${appName}/detail?cluster=${cluster}`}>App</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>AuditLog</Breadcrumb.Item>
        </Breadcrumb>

        <div className="logStyle">
          <Collapse bordered={false} defaultActiveKey={['1']}>
            <Panel header={<h2>Operation Log</h2>} key="1">
              <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                size='small'
              />
            </Panel>
          </Collapse>
        </div>
</Content>
        );
 }

 getAppName(props = this.props) {
    return props.match.params.appName;
  }

}

export default AppAuditLog;
