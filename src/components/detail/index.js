import React from 'react';
import { Collapse, Table, Icon, Divider, Dropdown, Menu, Button } from 'antd';
import { Link } from 'react-router-dom'; 
import { getDetail, getReleases } from 'api';
import './index.css';
const Panel = Collapse.Panel;

const data = {
    name: 'test',
    space: 'default',
    label: {
        web: 'true',
        hah: 'yes'
    },
    comments: 'this is comments',
    created: '2018-10-00',
    select: '~',
    strategies: '~',
    mintime: '1s',
    history: '2',
    maxadd: '2',
    maxinvalid: '0',
    updated: '3',
    total: '4',
    used: '3',
    unused: '1'
}

const columns = [
    {
        title: 'id',
        dataIndex: 'id',
        width: '5%',
    }, {
        title: 'updated',
        dataIndex: 'updated',
        width: '15%',
    }, {
        title: 'created',
        dataIndex: 'created',
        width: '15%',
        sorter: (a, b) => a.name.length - b.name.length,
    }, {
        title: 'image',
        dataIndex: 'image',
        width: '30%',
    }, {
        title: 'misc',
        dataIndex: 'misc',
        width: '20%',
        render: misc => {
            let miscToJson = JSON.parse(misc);
            return (
                <div>
                    <span style={spanStyle}>commit_message: {miscToJson.commit_message ? miscToJson.commit_message : 'null'}</span>
                    <span style={spanStyle}>author: {miscToJson.author ? miscToJson.author : 'null'}</span><br/>
                    <span style={spanStyle}>git: {miscToJson.git}</span>
                </div>
            )
        }
    }, {
        title: 'tag',
        dataIndex: 'tag',
        width: '10%',
    }, {
        title: 'more',
        dataIndex: 'more',
        render() {

            const menu = (
                <Menu>
                    <Menu.Item key="0">
                        <a href="#">回滚</a>
                    </Menu.Item>
                    <Menu.Item key="1">
                        <a href="#">升级</a>
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="3">
                        <a href="#">编辑</a>
                    </Menu.Item>
                </Menu>
            );

            return (
                <Dropdown overlay={menu} trigger={['click']}>
                    <a className="ant-dropdown-link" href="#">
                        <Icon type="ellipsis" className="btnIcon" />
                    </a>
                </Dropdown>
            )
        }
    }
]

const spanStyle = {
    padding: '0 4px',
    marginRight: '4px',
    background: '#eee',
    border: '1px solid #ccc',
    borderRadius: '6px'
}

class AppDetail extends React.Component {

    constructor() {
        super();
        this.state = {
            name: '',
            data: [],
            tableData: [],
            visible: false
        }
    }

    componentDidMount() {
        const name = window.location.href.split('app=')[1];
        this.setState({
            name: name
        });

        getDetail(name).then(res => {
            this.setState({
                data: res
            })
        });
        getReleases(name).then(res => {
            this.setState({
                tableData: res
            })
        });
    }

    hide() {
        this.setState({
            visible: false,
        });
    }

    handleVisibleChange(visible) {
        this.setState({ visible });
    }

    render() {

        const { data, name } = this.state;

        let labels = [];
        for (let p in data.label) {
            labels.push(<span style={spanStyle} key={p}>{p}: {data.label[p]}</span>)
        }

        

        return (
            <div className="detailPage">
                <h1><strong>{name}</strong>:详情页面</h1>
                <Collapse bordered={false} defaultActiveKey={['1']}>
                    <Panel header={<h2>详情</h2>} key="1">
                        <div className="detailLeft">
                            <p>名称：{data.name}</p>
                            <p>命名空间：{data.space ? data.space : 'default'}</p>
                            <p>标签： {data.type}</p>
                            <p>注释： {data.comments ? data.comments : '无'}</p>
                            <p>创建时间： {data.created}</p>
                            <p>更新时间： {data.updated}</p>
                            <p>历史版本限制值： {data.history}</p>
                            <p>滚动更新策略： 最大激增数：{data.maxadd}，最大无效数：{data.maxinvalid}</p>
                            <p>状态： 个已更新，共计 {data.total}个， {data.used}个可用， {data.unused}个不可用</p>
                            <Button><Link to={`/logger?app=${name}`}>查看日志</Link></Button>
                        </div>
                        <div className="detailRight">
                        </div>
                    </Panel>
                </Collapse>

                <div style={{ height: '40px' }}></div>

                <Collapse bordered={false} defaultActiveKey={['1']}>
                    <Panel header={<h2>副本集</h2>} key="1">
                        <Table 
                            
                        />
                    </Panel>
                </Collapse>

                <div style={{ height: '40px' }}></div>

                <Collapse bordered={false} defaultActiveKey={['1']}>
                    <Panel header={<h2>版本信息</h2>} key="1">
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

export default AppDetail;