import React from 'react';
import { Divider, Collapse, Table } from 'antd';
import './index.css';
const Panel = Collapse.Panel;

const columns = [
    {
        title: 'name',
        dataIndex: 'name',
    }, {
        title: 'status',
        dataIndex: 'status',
    }, {
        title: 'creation',
        dataIndex: 'creation',
        defaultSortOrder: 'descend',
        sorter: (a, b) => {
            let c = new Date(a.creation).getTime();
            let d = new Date(b.creation).getTime();
            return c - d
        }
    }, {
        title: 'user',
        dataIndex: 'user',
    }, {
        title: 'log',
        dataIndex: 'log',
        render() {
            return (
                <span style={{color: '#347EFF', cursor: 'pointer'}}>log</span>
            )
        }
    }
]

class AppJob extends React.Component {

    constructor() {
        super();
        this.state = {
            data: []
        }
    }

    render() {
        return (
            <div className="jobList">
                <Collapse bordered={false} defaultActiveKey={['1']}>
                    <Panel header={<h2>job列表</h2>} key="1">
                        <Table 
                            columns={columns} 
                            dataSource={this.state.data}
                            rowKey="name"
                            // onRow={(record) => {
                            //     return {
                            //         onClick: () => {this.props.history.push(`/detail?app=${record.name}`);},       // 点击行
                            //     };
                            // }}
                        />
                    </Panel>
                </Collapse>
            </div>
        )
    }
}

export default AppJob;