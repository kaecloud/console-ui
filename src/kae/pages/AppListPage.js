import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Collapse, Table, Input, Button, Icon } from 'antd';

import { getRequestFromProps } from '../models/Utils';
import * as AppActions from '../models/actions/Apps';

const Panel = Collapse.Panel;

class AppList extends React.Component {
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
    const {dispatch} = this.props;
    dispatch(AppActions.list());
  }

  render() {
    const columns = [
      {
        title: 'name',
        dataIndex: 'name',
      }, {
        title: 'Git',
        dataIndex: 'git'
      }, {
        title: 'Type',
        dataIndex: 'type'
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
        title: 'Updated',
        dataIndex: 'updated'
      }
    ];

    const request = getRequestFromProps(this.props, 'LIST_APP_REQUEST');
    let data = [];
    if (request.statusCode === 200) {
      data = request.data;
    }
    return (
      <div className="appList">
        <Collapse bordered={false} defaultActiveKey={['1']}>
          <Panel header={<h2>应用列表</h2>} key="1">
            <Table
              columns={columns}
              dataSource={data}
              size='small'
              rowKey="name"
              onRow={(record) => {
                return {
                  onClick: () => {
                    this.props.history.push(`/apps/${record.name}/detail?cluster=`);
                  }
                };
              }}
            />
          </Panel>
        </Collapse>
      </div>
        );
    }
}

export default withRouter(AppList);
