import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { appList } from 'api';
import { Table, Collapse } from 'antd';
const Panel = Collapse.Panel;

import './index.css';

const columns = [
    {
        title: 'name',
        dataIndex: 'name',
    }, {
        title: 'Git',
        dataIndex: 'git',
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
        title: 'Updated',
        dataIndex: 'updated',
    }, {
        title: 'Type',
        dataIndex: 'type',
    }
];

class AppList extends React.Component {

    constructor() {
        super();
        this.state = {
            data: []
        }
    }

    componentDidMount() {
        appList().then(res => {
            this.setState({
                data: res
            });
        });
    }

    render() {
        return (
            <div className="appList">
                <Collapse bordered={false} defaultActiveKey={['1']}>
                    <Panel header={<h2>应用列表</h2>} key="1">
                        <Table 
                            columns={columns} 
                            dataSource={this.state.data}
                            rowKey="name"
                            onRow={(record) => {
                                return {
                                    onClick: () => {this.props.history.push(`/detail?app=${record.name}`);},       // 点击行
                                };
                            }}
                        />
                    </Panel>
                </Collapse>
            </div>
        )
    }
}

export default withRouter(AppList);