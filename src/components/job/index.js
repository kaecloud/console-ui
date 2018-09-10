import React from 'react';
import {Icon, Divider, Collapse, Table, Button, Modal, Select, Form, Input, InputNumber, Menu, Dropdown, Checkbox, notification } from 'antd';
import {jobList, createJob, getUserId, restartJob, deleteJob} from 'api';
import {Link} from 'react-router-dom';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/yaml';
import 'brace/theme/xcode';

import './index.css';
const { TextArea } = Input;
const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;

let yamlConfig = '';

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 30 },
        sm: { span: 18 },
    },
};

function onChange(newValue) {
    yamlConfig = newValue
    // console.log(newValue)
}

class AppJob extends React.Component {

    constructor() {
        super();
        let self = this;
        this.state = {
            isForm: true,
            visible: false,
            logVisible: false,
            formData: {},
            username: '',
            logMsg: '',
            showMsg: '',
            username: '1',
            data: [],
            columns: [
                {
                    title: 'name',
                    dataIndex: 'name',
                }, {
                    title: 'status',
                    dataIndex: 'status',
                    filters: [{
                        text: 'Hidden',
                        value: 'Hidden',
                    }, {
                        text: 'Complete',
                        value: 'Complete',
                    }, {
                        text: 'Fav',
                        value: 'Fav',
                    }, {
                        text: 'Running',
                        value: 'Running',
                    }],
                    onFilter: (value, record) => record.status.indexOf(value) === 0,
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
                    title: 'updated',
                    dataIndex: 'updated',
                }, {
                    title: 'user',
                    dataIndex: 'user',
                }, {
                    title: 'log',
                    dataIndex: 'log',
                    render(text, record) {
                        return (
                            <span style={{color: '#347EFF', cursor: 'pointer'}} onClick={() => {self.handleShowMessage(record.name)}}>log</span>
                        )
                    }
                }, {
                    title: 'Action',
                    dataIndex: 'action',
                    render(text, record) {
                        const menu = (
                            <Menu>
                                <Menu.Item key="1">
                                    <div onClick={() => {self.handleRestart(record.name)}}>Restart</div>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="2">
                                    <div onClick={() => {self.handleDelete(record.name)}}>Delete</div>
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
            ]
        }
    }

    handleSubmit(e) {
        const {isForm, name} = this.state

        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if(isForm) {
                    let job;
                    if(values.gpus === 0) {
                        job = {
                            jobname: values.jobname,
                            git: values.git,
                            commit: values.commitId,
                            autoRestart: values.autoRestart,
                            image: values.image,
                            command: values.command,
                            shell: values.shell
                        }
                    }else {
                        job = {
                            jobname: values.jobname,
                            git: values.git,
                            commit: values.commitId,
                            autoRestart: values.autoRestart,
                            image: values.image,
                            command: values.command,
                            shell: values.shell
                        }
                    }
                    // console.log(job)
                    createJob(job).then(res => {
                        this.getJobDetail();

                        notification.destroy()
                        notification.success({
                            message: '成功！',
                            description: `Create Success!`,
                        });
                        this.setState({
                            visible: false
                        });
                    }).catch(err => {
                        let res = err.response;
                        let errorMsg;
                        if(res.data.indexOf('<p>') !== -1 ) {
                            errorMsg = res.data.split('<p>')[1].split('</p>')[0]; 
                        }else {
                            let data = JSON.parse(res.data);
                            errorMsg = data.error;
                        }

                        notification.destroy()
                        notification.error({
                            message: '失败！',
                            description: `${res.status}: ${errorMsg}`,
                            duration: 0,
                        });
                    });
                }else {
                    // console.log({
                    //     specs_text: yamlConfig
                    // })
                    createJob({
                        specs_text: yamlConfig
                    }).then(res => {
                        this.getJobDetail();
                    });
                }
            }
        });
    }

    handleChange(newValue) {
        if(newValue === 'form') {
            this.setState({
                isForm: true
            });
        }else {
            this.setState({
                isForm: false
            });
        }
    }

    handleRestart(name) {
        restartJob({name: name}).then(res => {
            if(JSON.parse(res).error === null) {

                notification.destroy()
                notification.success({
                    message: '成功！',
                    description: `Restart Success!`,
                });
            }
        }).catch(err => {
            let res = err.response;
            let errorMsg;
            if(res.data.indexOf('<p>') !== -1 ) {
                errorMsg = res.data.split('<p>')[1].split('</p>')[0]; 
            }

            notification.destroy()
            notification.error({
                message: '失败！',
                description: `${res.status}: ${errorMsg}`,
                duration: 0,
            });
        });
        this.getJobDetail();
    }

    handleDelete(name) {
        deleteJob({name: name}).then(res => {
            if(res.error === null) {

                notification.destroy()
                notification.success({
                    message: '成功！',
                    description: `Delete Success!`,
                });
                let {data} = this.state;
                data.map((d, index) => {
                    if(d.name === name) {
                        data.splice(index, 1);
                        this.setState({
                            data: data
                        })
                    }
                })
            } else {
                notification.destroy()
                notification.error({
                    message: '失败！',
                    description: 'Delete Fail',
                    duration: 0,
                });
            }
        });
    }

    handleShowMessage(name) {
        let self = this;
        let showMsg = [];
        // console.log(name);
        this.setState({logVisible: true});

        let prodSchema = "ws:"
        if (window.location.protocol === "https:") {
            prodSchema = "wss:"
        }
        const wsUrl = process.env.NODE_ENV === 'production' ? prodSchema + '//'+window.location.host : 'ws://192.168.1.17:5000';
        const ws = new WebSocket(`${wsUrl}/api/v1/ws/job/${name}/log/events`);
        ws.onopen = function(evt) {
            // console.log("Connection open ...");
        };
        ws.onclose = function(evt) {
            console.log("Build finished")
        }
        ws.onerror = function(evt) {
            let msg = JSON.parse(evt.data).data

            notification.destroy()
            notification.error({
                message: '错误信息',
                description: `${msg}`,
                duration: 0,
            });
        }

        ws.onmessage = function(evt) {
            let msg = JSON.parse(evt.data)
            if(msg.error !== undefined) {
                msg = msg.error.split('\n');
                let arr = [];
                msg.forEach((d, index) => {
                    arr.push(<p key={index}>{d}</p>)
                })
                const errMsg = (
                    <div style={{color: 'red'}}>
                        {arr}
                    </div>
                )
                self.setState({
                    logMsg: errMsg
                })
            }else {
                msg = msg.data;
                showMsg.push(<p key={msg}>{msg}</p>)
                self.setState({
                    showMsg: showMsg
                })
            }
        }
    }

    getJobDetail() {
        getUserId().then(res => {
            let username = res.nickname;
            jobList().then(res => {
                let data = res;
                data.map(d => {
                    d.user = username
                })
                this.setState({
                    data: data
                })
            }); 
        });
    }

    componentDidMount() {
        // // 测试数据
        // getUserId().then(res => {
        //     let username = res.nickname;
        //     let data = this.state.data;
        //     data.map(d => {
        //         d.user = username
        //     })
        //     this.setState({
        //         data: data
        //     })
        // });

        // 获取username和data
        this.getJobDetail();
    }

    render() {

        const { getFieldDecorator } = this.props.form;
        const {isForm, columns} = this.state;
        const modalContent = isForm ? (
            <Form style={{marginTop: '20px'}} onSubmit={this.handleSubmit.bind(this)}>
                <FormItem
                    {...formItemLayout}
                    label="Jobname"
                >
                    {getFieldDecorator('jobname', {
                        rules: [{ required: true, message: 'Please input your jobname!' }],
                    })(
                        <Input placeholder="Jobname"/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Git"
                >
                    {getFieldDecorator('git', {
                        rules: [{ message: 'Please input your git!' }],
                    })(
                        <Input placeholder="Git"/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="GPUs"
                >
                    {getFieldDecorator('gpus', {
                        initialValue: 0,
                    })(
                        <InputNumber min={0} max={10} />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="autoRestart"
                >
                    {getFieldDecorator('autoRestart', {
                        valuePropName: 'checked',
                        initialValue: false,
                    })(
                        <Checkbox></Checkbox>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="shell"
                >
                    {getFieldDecorator('shell', {
                        valuePropName: 'checked',
                        initialValue: false,
                    })(
                        <Checkbox></Checkbox>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Command"
                >
                    {getFieldDecorator('command', {
                        rules: [{ required: true, message: 'Please input your command!' }],
                    })(
                        <TextArea rows={4} />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Image"
                >
                    {getFieldDecorator('image', {
                        rules: [{ required: true, message: 'Please input your image!' }],
                    })(
                        <Input/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Commit id"
                >
                    {getFieldDecorator('commitId')(
                        <Input/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Branch"
                >
                    {getFieldDecorator('branch')(
                        <Input/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Comments"
                >
                    {getFieldDecorator('comments')(
                        <TextArea rows={4} />
                    )}
                </FormItem>
                <Button type="primary" htmlType="submit" className="create-job-button">
                    Create Job
                </Button>
            </Form>
        ) : (
            <div>
                <AceEditor
                    mode="yaml"
                    theme="xcode"
                    onChange={onChange}
                    name="yaml"
                    fontSize={18}
                    width="450px"
                    height="600px"
                    editorProps={{$blockScrolling: true}}
                />
                <Button type="primary" className="create-job-button" onClick={this.handleSubmit.bind(this)}>
                    Create Job
                </Button>
            </div>
        )

        return (
            <div className="jobList">
                <Collapse bordered={false} defaultActiveKey={['1']}>
                    <Panel header={<h2>job列表</h2>} key="1">
                        <Button type="primary" style={{zIndex: '9', marginBottom: '20px'}} onClick={() => {this.setState({visible: true})}}>Create Job</Button>    
                        <Icon type="reload" className="reload" onClick={this.getJobDetail.bind(this)}/>
                        <Table 
                            columns={columns} 
                            dataSource={this.state.data}
                            rowKey="name"
                        />

                        <Modal
                            title="Create Job"
                            visible={this.state.visible}
                            onCancel={() => {this.setState({visible: false})}}
                            footer={null}
                        >
                            <span>选择创建方式：</span>
                            <Select defaultValue="form" style={{ width: 80 }} onChange={this.handleChange.bind(this)}>
                                <Option value="form">Form</Option>
                                <Option value="yaml">yaml</Option>
                            </Select>
                            {modalContent}
                        </Modal>
                    </Panel>
                </Collapse>
                <Modal
                    title="logger"
                    visible={this.state.logVisible}
                    onCancel={() => {this.setState({logVisible: false, showMsg: '', logMsg: ''})}}
                    footer={null}
                >
                    <div>{this.state.showMsg}</div>
                    <div>{this.state.logMsg}</div>
                </Modal>
            </div>
        )
    }
}

export default Form.create()(AppJob);