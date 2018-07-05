import React from 'react';
import { Collapse, Table, Icon, Divider, Dropdown, Menu, Button, Modal, InputNumber, notification } from 'antd';
import { Link } from 'react-router-dom';
import { getDetail, getPods, getReleases, appBuild, appDeploy, appScale, appRollback, appRenew, getCluster } from 'api';
import emitter from "../event";
import './index.css';
const Panel = Collapse.Panel;

const spanStyle = {
    padding: '0 4px',
    marginRight: '4px',
    background: '#eee',
    border: '1px solid #ccc',
    borderRadius: '6px'
}

function extractDataFromPod(pod) {
    var msToHuman = function(ms) {
        var numdays, numhours, numminutes;
        var seconds = ms / 1000;
        numdays = Math.floor(seconds / 86400);
        if (numdays > 0) {
            return numdays + 'd';
        }
        numhours = Math.floor(seconds / 3600);
        if (numhours > 0) {
            return numhours + 'h';
        }
        numminutes = Math.floor(seconds / 60);
        if (numminutes > 0) {
            return numminutes + 'm';
        }
        return seconds + 's';
    }
    // get ready count
    let restart_count = 0;
    let ready_count = 0;
    let ready_total = pod.spec.containers.length;
    if (pod.status.container_statuses) {
        for (let cont_status of pod.status.container_statuses) {
            if (cont_status.ready) {
                ready_count++;
            }
            if (cont_status.restart_count > restart_count) {
                restart_count = cont_status.restart_count;
            }
        }
    }
    let start_time_str = pod.status.start_time;
    if (start_time_str && !start_time_str.endsWith("GMT")) {
        start_time_str += " GMT";
    }
    let start_time = new Date(start_time_str);
    let interval = Date.now() - start_time;

    let data = {
        ready: ready_count + "/" + ready_total,
        name: pod.metadata.name,
        status: pod.status.phase,
        restarts: restart_count,
        age: msToHuman(interval)
    }
    return data
}
class AppDetail extends React.Component {

    constructor() {
        super();
        let self = this;
        this.state = {
            text: '',
            example: '',
            name: '',
            nowTag: '',
            version: '',
            nowCluster: '',
            scaleNum: 1,
            data: [],
            tableData: [],
            podTableData: [],
            visible: false,
            textVisible: false,
            scaleVisible: false,
            renewVisible: false,
            rollbackVisible: false,
            buildVisible: false,
            deployVisible: false,
            source: Object,
            columns: [
                {
                    title: 'tag',
                    dataIndex: 'tag',
                    width: '14%',
                    render: tag => {
                        let nowVersion = this.state.version === tag;
                        if(nowVersion) {
                            return (
                                <span>{tag} <span style={{fontSize: '12px', color: 'red'}}>(当前版本)</span></span>
                            )
                        }else {
                            return (
                                <span>{tag}</span>
                            )
                        }
                    }
                }, {
                    title: 'created',
                    dataIndex: 'created',
                    width: '15%',
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => {
                        let c = new Date(a.created).getTime();
                        let d = new Date(b.created).getTime();
                        return c - d
                    }
                }, {
                    title: 'updated',
                    dataIndex: 'updated',
                    width: '15%',
                }, {
                    title: 'image',
                    dataIndex: 'image',
                    width: '35%',
                }, {
                    title: 'build_status',
                    dataIndex: 'build_status',
                    width: '10%',
                    render(build_status) {
                        return build_status + ''
                    }
                }, {
                    title: 'Action',
                    dataIndex: 'action',
                    width: '16%',
                    render(text, record) {
                        const menu = (
                            <Menu>
                                {
                                    record.build_status ? '' : (
                                        <Menu.Item key="0">
                                            <div onClick={() => {self.setState({nowTag: record.tag, buildVisible: true})}}>Build</div>
                                        </Menu.Item>
                                    )
                                }
                                <Menu.Item key="1">
                                    <div onClick={() => {self.setState({nowTag: record.tag, deployVisible: true})}}>Deploy</div>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="2">
                                    <div onClick={() => {self.handleText(record.specs_text)}}>配置</div>
                                </Menu.Item>
                            </Menu>
                        );

                        return (
                            <Dropdown overlay={menu} trigger={['click']}>
                                <a className="ant-dropdown-link" href="#">
                                    <div style={{width: '40px', textAlign: 'center'}}>
                                        <Icon type="ellipsis" className="btnIcon" />
                                    </div>
                                </a>
                            </Dropdown>
                        )
                    }
                }
            ],
            podColumns: [
                {
                    title: 'NAME',
                    dataIndex: 'name',
                    width: '20%'
                },
                {
                    title: 'READY',
                    dataIndex: 'ready',
                    align: 'center',
                    width: '20%'
                },
                {
                    title: 'STATUS',
                    dataIndex: 'status',
                    align: 'center',
                    width: '20%'
                },
                {
                    title: 'RESTARTS',
                    dataIndex: 'restarts',
                    align: 'center',
                    width: '20%'
                },
                {
                    title: 'AGE',
                    dataIndex: 'age',
                    align: 'center',
                    width: '20%'
                }
            ]
        }
        this.handleMsg = this.handleMsg.bind(this);
    }

    componentDidMount() {
        let that = this;
        
        // 获取APP name
        const name = window.location.href.split('app=')[1].split('&cluster=')[0];

        const defaultCluster = window.location.href.split('app=')[1].split('&cluster=')[1];

        // 测试地址
        const testUrl = process.env.NODE_ENV === 'production' ? '' : 'http://192.168.1.17:5000';

        that.setState({
            name: name,
        });

        getReleases(name).then(res => {
            that.setState({
                tableData: res
            })
        });

        if(defaultCluster) {
            getMsg(name, defaultCluster);
        }else {

            that.eventEmitter = emitter.addListener("clusterChange",(cluster)=>{
                getMsg(name, cluster);
            });

            getCluster().then(res => {
                getMsg(name, res[0]);
            })
        }

        function getMsg(name, cluster) {
            // server sent event
            const source = new EventSource(`${testUrl}/api/v1/app/${name}/pods/events?cluster=${cluster}`, { withCredentials: true });
            that.setState({
                nowCluster: cluster,
                source: source
            })
            getDetail({name: name, cluster: cluster}).then(res => {
                that.setState({
                    data: res,
                    version: res.metadata.annotations.release_tag
                })
            }).catch(err => {
                that.handleError(err);
            });
            getPods({name: name, cluster: cluster}).then(res => {
                let arr = [];
                res.items.map(d => {
                    let temp = extractDataFromPod(d);
                    arr.push(temp);
                })
                that.setState({
                    podTableData: arr
                })
            }).catch(err => {
                that.handleError(err);
            });
        }
    }

    componentWillMount() {
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

    // 关闭配置弹框
    handleCancel() {
        this.setState({
            visible: false,
        });
    }

    // SSE
    serverSentEvent() {
        let self = this;
        self.state.source.addEventListener('pod', function (event) {
            let tmp = JSON.parse(event.data);
            let action = tmp.action;
            let data = extractDataFromPod(tmp.object);

            let { podTableData } = self.state;
            let temp = podTableData;
            if(action === 'ADDED') {
                for(let d of temp) {
                    // console.log(d.name === data.name)
                    if(d.name === data.name) {
                        // d.status = data.status;
                        temp = [];
                        break;
                    }else {
                        temp.push(data);
                        let set = new Set(temp);
                        self.setState({
                            podTableData: [...set]
                        })
                        temp = [];
                        break;
                    }
                }
            }else if(action === 'MODIFIED') {
                for(let d of temp) {
                    // console.log('MODIFIED', data)
                    if(d.name === data.name) {
                        let index = temp.indexOf(d);
                        // console.log(index)
                        temp.splice(index, 1, data);
                        // console.log(index, temp);
                        let set = new Set(temp);
                        self.setState({
                            podTableData: [...set]
                        })
                        break;
                    }
                }
            }else if(action === 'DELETED') {
                for(let d of temp) {
                    if(d.name === data.name) {
                        let index = temp.indexOf(d);
                        temp.splice(index, 1);
                        let set = new Set(temp);
                        self.setState({
                            podTableData: [...set]
                        })
                        break;
                    }
                }
            }
        }, false);
    }

    // 构建
    handleBuild() {
        this.setState({buildVisible: false})
        let { name, nowTag } = this.state;
        appBuild({name: name, tag: nowTag}).then(res => {
            this.handleMsg(res, 'Build');
        }).catch(err => {
            this.handleError(err);
        });
    }

    // 部署
    handleDeploy() {
        this.setState({deployVisible: false})
        let { name, nowTag, nowCluster } = this.state;
        appDeploy({name: name, tag: nowTag, cluster: nowCluster}).then(res => {
            this.handleMsg(res, 'Deploy');
        }).catch(err => {
            this.handleError(err);
        });
    }

    // 更新
    handleRenew() {
        this.setState({renewVisible: false})
        let {name, nowCluster} = this.state;
        appRenew({name: name, cluster: nowCluster}).then(res => {
            this.handleMsg(res, 'Renew');
        }).catch(err => {
            this.handleError(err);
        });
    }

    // 伸缩
    handleScale() {
        this.setState({scaleVisible: false})
        let {name, scaleNum, nowCluster} = this.state;
        appScale({name: name, replicas: scaleNum, cluster: nowCluster}).then(res => {
            this.handleMsg(res, 'Scale');
        }).catch(err => {
            this.handleError(err);
        });
    }

    // 回滚
    handleRollback() {
        this.setState({rollbackVisible: false})
        let {name, nowCluster} = this.state
        appRollback({name: name, cluster: nowCluster}).then(res => {
            this.handleMsg(res, 'Rollback');
        }).catch(err => {
            this.handleError(err);
        });
    }

    // 显示信息
    handleMsg(data, action) {
        // SSE
        this.serverSentEvent();

        // 提示成功或失败
        let msg = JSON.parse(data);
        // let msg = {error: '1', msg: '1111111'}
        if(msg.error === null) {
            notification.success({
                message: '成功！',
                description: `${action} Success!`,
            });
        }else {
            // 报错信息以html格式显示
            const description = (
                <div>
                    <p>{msg.msg}</p>
                </div>
            );
            notification.error({
                message: '失败！',
                description,
                duration: 0,
            });
        }
    }

    // 显示错误
    handleError(err) {
        let res = err.response;
        let errorMsg;
        let status;
        if(!res) {
            errorMsg = err.message;
            status = 500;
        }else {
            status = res.status;
            if(res.data.indexOf('<p>') !== -1 ) {
                errorMsg = res.data.split('<p>')[1].split('</p>')[0]; 
            }else {
                let data = JSON.parse(res.data);
                errorMsg = data.error;
            }
        }
        notification.error({
            message: '失败！',
            description: `${status}: ${errorMsg}`,
            duration: 0,
        });
    } 

    render() {
        const { data, name, columns, podColumns } = this.state;

        let labels = [],
            annotations = [],
            match_labels = [],
            detailData = {
                created: '',
                history: '',
                rolling_update: {},
                status: {},
                strategy: '',
                min_ready_seconds: ''
            };

        if(data.length !== 0) {
            // 详情的数据
            detailData = {
                created: data.metadata.creation_timestamp,
                history: data.spec.revision_history_limit,
                rolling_update: data.spec.strategy.rolling_update,
                strategy: data.spec.strategy.type,
                min_ready_seconds: data.spec.min_ready_seconds === null ? '0' : data.spec.min_ready_seconds,
                status: data.status
            }

            // 标签样式
            for (let p in data.metadata.labels) {
                labels.push(<span style={spanStyle} key={p}>{p}: {data.metadata.labels[p]}</span>)
            }
            // 选择器样式
            for (let p in data.spec.selector.match_labels) {
                match_labels.push(<span style={spanStyle} key={p}>{p}: {data.spec.selector.match_labels[p]}</span>)
            }
            // 注释样式
            for (let p in data.metadata.annotations) {
                if(p !== 'app_specs_text') {
                    annotations.push(<span style={spanStyle} key={p}>{p}: {data.metadata.annotations[p]}</span>)
                }
            }
        }

        return (
            <div>
                <div className="detailPage">
                    <Collapse bordered={false} defaultActiveKey={['1']}>
                        <Panel header={<h2>详情</h2>} key="1">
                            <div className="detailLeft">
                                <p>名称：{name}</p>
                                <p>命名空间：{data.space ? data.space : 'default'}</p>
                                <p>标签： {labels}</p>
                                <p>注释： {annotations ? annotations : '无'}</p>
                                <p>创建时间： {detailData.created}</p>
                                <p>选择器： {match_labels}</p>
                                <p>策略： {detailData.strategy}</p>
                                <p>最小就绪秒数： {detailData.min_ready_seconds}</p>
                                <p>历史版本限制值： {detailData.history}</p>
                                <p>滚动更新策略： 最大激增数：{detailData.rolling_update.max_surge}，最大无效数：{detailData.rolling_update.max_unavailable}</p>
                                <p>状态： {detailData.status.updated_replicas}个已更新，共计 {detailData.status.ready_replicas}个， {detailData.status.available_replicas}个可用， {detailData.status.unavailable_replicas === null ? '0' : detailData.status.unavailable_replicas}个不可用</p>
                                <Button type="primary"><Link to={`/logger?app=${name}`}>查看日志</Link></Button>
                                <Button onClick={() => {this.setState({renewVisible: true})}}>Renew</Button>
                                <Button onClick={() => {this.setState({scaleVisible: true})}}>Scale</Button>
                                <Button onClick={() => {this.setState({rollbackVisible: true})}}>Rollback</Button>
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
                                columns={podColumns}
                                dataSource={this.state.podTableData}
                                rowKey="name"
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

                    <Modal
                        title="伸缩 部署"
                        visible={this.state.scaleVisible}
                        onOk={this.handleScale.bind(this)}
                        onCancel={() => {this.setState({scaleVisible: false})}}
                    >
                        <span>所需容器数量：</span>
                        <InputNumber min={1} max={10} defaultValue={1} onChange={num => {this.setState({scaleNum: num})}} />
                    </Modal>

                    <Modal
                        title="更新"
                        visible={this.state.renewVisible}
                        onOk={this.handleRenew.bind(this)}
                        onCancel={() => {this.setState({renewVisible: false})}}
                    >
                        <p>Force kubernetes to recreate the pods of specified app!</p>
                    </Modal>

                    <Modal
                        title="回滚"
                        visible={this.state.rollbackVisible}
                        onOk={this.handleRollback.bind(this)}
                        onCancel={() => {this.setState({rollbackVisible: false})}}
                    >
                        <p>Rollback specified app!</p>
                    </Modal>

                    <Modal
                        title="部署"
                        visible={this.state.deployVisible}
                        onOk={this.handleDeploy.bind(this)}
                        onCancel={() => {this.setState({deployVisible: false})}}
                    >
                        <p>Deployment app to kubernetes!</p>
                    </Modal>

                    <Modal
                        title="构建"
                        visible={this.state.buildVisible}
                        onOk={this.handleBuild.bind(this)}
                        onCancel={() => {this.setState({buildVisible: false})}}
                    >
                        <p>Build an image for the specified release, the API will return all docker!</p>
                    </Modal>
                    <div id="example"></div>
                </div>
            </div>
        )
    }
}

export default AppDetail;
