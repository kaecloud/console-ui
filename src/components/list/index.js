import React from 'react';
import { Link } from 'react-router-dom';
import { appList } from 'api';
import { Table, Collapse } from 'antd';
const Panel = Collapse.Panel;

import './index.css';

const columns = [
    {
        title: 'name',
        dataIndex: 'name',
        render: name => {
            return (
                <Link to={`/detail?app=${name}`}>{name}</Link>
            )
        }
    }, {
        title: 'Git',
        dataIndex: 'git',
        sorter: (a, b) => a.name.length - b.name.length,
    }, {
        title: 'Updated',
        dataIndex: 'updated',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.age - b.age,
    }, {
        title: 'created',
        dataIndex: 'created',
    }, {
        title: 'Type',
        dataIndex: 'type',
        sorter: (a, b) => a.address.length - b.address.length,
    }
];

function onChange(pagination, filters, sorter) {
    console.log('params', pagination, filters, sorter);
}

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
                            onChange={onChange} 
                            rowKey="name"
                        />
                    </Panel>
                </Collapse>
                
            </div>
        )
    }
}

export default AppList;