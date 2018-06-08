import React from 'react';
import { getLogger } from 'api';
import { Collapse, Table, Icon } from 'antd';
import './index.css';

const Panel = Collapse.Panel;

const columns = [
    {
        title: '用户',
        dataIndex: 'username',
        width: '10%'
    }, {
        title: '应用',
        dataIndex: 'appname',
        width: '20%',
    }, {
        title: '创建时间',
        dataIndex: 'created',
        key: 'created',
        width: '15%',
        defaultSortOrder: 'descend',
        sorter: (a, b) => {
            let c = new Date(a.created).getTime();
            let d = new Date(b.created).getTime();
            return c - d
        }
    }, {
        title: '更新时间',
        dataIndex: 'updated',
        width: '15%',
    }, {
        title: '修改内容',
        dataIndex: 'content',
        render: content => {
            return (
                <span>{content ? content : '无'}</span>
            )
        }
    }, {
        title: '操作',
        dataIndex: 'action',
        width: '20%',
        
    }
]

class AppLog extends React.Component {

    constructor() {
        super();
        this.state = {
            name: '',
            tableData: []
        }
    }

    componentDidMount() {
        const name = window.location.href.split('app=')[1];
        this.setState({
            name: name
        });
        getLogger(name).then(res => {
            this.setState({
                tableData: res
            });
        });
    }

    render() {

        return (
            <div className="logStyle">
                <h1><strong>{this.state.name}</strong>:日志信息</h1>
                <Collapse bordered={false} defaultActiveKey={['1']}>
                    <Panel header={<h2>logger</h2>} key="1">
                        <Table 
                            columns={columns} 
                            dataSource={this.state.tableData} 
                            rowKey="id"
                        />
                    </Panel>
                </Collapse>
            </div>
        )
    }
}

export default AppLog;