import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { appList } from 'api';
import { Table, Collapse } from 'antd';
const Panel = Collapse.Panel;

const columns = [
    {
        title: 'name',
        dataIndex: 'name',
    }, {
        title: 'Git',
        dataIndex: 'git',
    }, {
        title: 'Type',
        dataIndex: 'type',
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
                            size='small'
                            rowKey="name"
                            onRow={(record) => {
                                return {
                                    onClick: () => {this.props.history.push(`/apps/${record.name}/detail?cluster=`);},// 点击行
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
