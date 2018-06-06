import React from 'react';
import { Collapse, Table, Icon, Divider, Dropdown, Menu, Button, Modal } from 'antd';
import { Link } from 'react-router-dom'; 
import { getDetail, getReleases, appBuild, appScale, appRollback, appRenew } from 'api';
import Typed from 'typed.js';
import './index.css';
const Panel = Collapse.Panel;

const spanStyle = {
    padding: '0 4px',
    marginRight: '4px',
    background: '#eee',
    border: '1px solid #ccc',
    borderRadius: '6px'
}

const options = {
    strings: ["<i>First</i> sentence.", "&amp; a second sentence."],
    typeSpeed: 40,
}

class AppDetail extends React.Component {

    constructor() {
        super();
        let self = this;
        this.state = {
            text: '',
            example: '',
            name: '',
            nowRowData: {},
            data: [],
            tableData: [],
            visible: false,
            textVisible: false,
            columns: [
                {
                    title: 'tag',
                    dataIndex: 'tag',
                    width: '10%',
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
                    title: 'more',
                    dataIndex: 'specs_text',
                    render(data) {
                        const menu = (
                            <Menu>
                                <Menu.Item key="0">
                                    <div onClick={self.handleBuild.bind(self)}>构建</div>
                                </Menu.Item>
                                <Menu.Item key="1">
                                    <div onClick={() => {self.handleText(data)}}>配置</div>
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
        }
        this.handleMsg = this.handleMsg.bind(this);
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
    
    // 关闭配置弹框
    handleCancel() {
        this.setState({
            visible: false,
        });
    }

    // 构建
    handleBuild() {
        let name = this.state.name;
        let data;
        appBuild({name: name, tag: 'v0.0.2'}).then(res => {
            this.handleMsg(JSON.stringify(res).replace(/,/g, '<br/>'));
        });
    }

    // 打开配置弹框
    handleText(data) {
        let text = data.replace(/\n/g, '<br/>');
        text = text.replace(/ /g, '&nbsp;&nbsp;');
        this.setState({ 
            text: text,
            visible: true
        });
    }

    // 更新
    handleRenew() {
        let name = this.state.name
        let data;
        appRenew({name: name}).then(res => {
            this.handleMsg(JSON.stringify(res));
        });
    }

    // 伸缩
    handleScale() {
        let name = this.state.name
        appScale({name: name, replicas: '1'})
    }

    // 回滚
    handleRollback() {
        let name = this.state.name
        let data;
        appRollback({name: name}).then(res => {
            this.handleMsg(JSON.stringify(res));
        });
    }

    // 显示信息
    handleMsg(data) {
        this.setState({
            textVisible: true
        })
        console.log(data)
        var typed = new Typed('.text', {
            strings: [data],
            typeSpeed: 40,
            onComplete: () => {
                setTimeout(() => {
                    this.setState({
                        textVisible: false
                    })
                }, 1000);
            }
        });
    }


    render() {
        const { data, name, columns } = this.state;

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
                            <Button onClick={this.handleRenew.bind(this)}>更新</Button>
                            <Button onClick={this.handleScale.bind(this)}>伸缩</Button>
                            <Button onClick={this.handleRollback.bind(this)}>回滚</Button>
                            <div>{this.state.example}</div>
                        </div>
                        { this.state.textVisible ? (
                            <div className="detailRight">
                                <div className="title-bar"></div>
                                <div className="text-body">
                                    <span className="text"></span>
                                </div>
                            </div>
                        ) : ''}
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
                            onRow={(record) => {
                                return {
                                    onClick: () => {this.setState({nowRowData: record})},       // 点击行
                                };
                            }}
                        />
                    </Panel>
                </Collapse>

                <Modal
                    title="配置信息"
                    visible={this.state.visible}
                    onOk={this.handleCancel.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    footer={[
                        <Button key="back" onClick={this.handleCancel.bind(this)}>取消</Button>,
                        <Button key="login" type="primary" onClick={this.handleCancel.bind(this)}>
                            确定
                        </Button>,
                    ]}
                >
                    <div dangerouslySetInnerHTML={{__html: this.state.text}}></div>
                </Modal>
            </div>
        )
    }
}

export default AppDetail;