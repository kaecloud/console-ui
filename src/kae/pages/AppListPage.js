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
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="custom-filter-dropdown">
              <Input
                ref={ele => this.searchInput = ele}
                placeholder="Search name"
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              />
            </div>
          ),
        filterIcon: filtered => <Icon type="smile-o" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
        onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
          if (visible) {
            setTimeout(() => {
              this.searchInput.focus();
            });
          }
        },
          render: (text) => {
            const { searchText } = this.state;
            return searchText ? (
              <span>
                {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
                  fragment.toLowerCase() === searchText.toLowerCase()
                    ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
                ))}
              </span>
            ) : text;
          },
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
