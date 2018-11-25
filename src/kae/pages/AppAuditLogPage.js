import React from 'react';
import { getLogger } from 'api';
import { Collapse, Table, Icon } from 'antd';

const Panel = Collapse.Panel;

const columns = [
  {
    title: '应用',
    dataIndex: 'appname',
    width: '10%',
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
    width: '10%',
    defaultSortOrder: 'descend',
    sorter: (a, b) => {
      let c = new Date(a.created).getTime();
      let d = new Date(b.created).getTime();
      return c - d;
    }
  }, {
    title: '操作',
    dataIndex: 'action',
    width: '10%',

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
    this.state = {
      tableData: []
    };
  }

  componentDidMount() {
    const name = this.getAppName();

    getLogger(name).then(res => {
      this.setState({
        tableData: res
      });
    });
  }

  render() {

    return (
        <div className="logStyle">
          <Collapse bordered={false} defaultActiveKey={['1']}>
            <Panel header={<h2>Operation Log</h2>} key="1">
              <Table
                columns={columns}
                dataSource={this.state.tableData}
                rowKey="id"
              />
            </Panel>
          </Collapse>
        </div>
        );
 }

 getAppName(props = this.props) {
    return props.params.appName;
  }

}

export default AppAuditLog;
