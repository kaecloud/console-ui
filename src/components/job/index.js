import React from 'react';
import {Icon, Divider, Collapse, Table, Button, Modal, Select, Form, Input, InputNumber, Menu, Dropdown, Checkbox } from 'antd';
import {jobList, createJob, getUserId} from 'api';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
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
        this.state = {
            isForm: true,
            visible: false,
            formData: {},
            username: '',
            username: '1',
            data: [
                {
                    "created": "2018-03-21 14:54:06",
                    "git": "git@github.com:projecteru2/console.git",
                    "id": 10001,
                    "name": "test-111",
                    "status": "Hidden",
                    "specs_text": "hahaha",
                    "updated": "2018-03-21 14:54:07"
                }, {
                    "created": "2018-03-11 14:54:06",
                    "git": "git@github.com:projecteru2/console.git",
                    "id": 10001,
                    "name": "test-222",
                    "status": "Fav",
                    "specs_text": "hahaha",
                    "updated": "2018-03-21 14:54:07"
                }, {
                    "created": "2018-03-18 14:54:06",
                    "git": "git@github.com:projecteru2/console.git",
                    "id": 10001,
                    "name": "test-333",
                    "status": "Running",
                    "specs_text": "333",
                    "updated": "2018-03-20 14:54:07"
                }, {
                    "created": "2018-03-23 14:54:06",
                    "git": "git@github.com:projecteru2/console.git",
                    "id": 10001,
                    "name": "test-444",
                    "status": "Running",
                    "specs_text": "444",
                    "updated": "2018-03-21 14:54:07"
                }
            ],
            columns: [
                {
                    title: 'name',
                    dataIndex: 'name',
                }, {
                    title: 'status',
                    dataIndex: 'status',
                    filters: [{
                        text: 'All',
                        value: 'All',
                    }, {
                        text: 'Hidden',
                        value: 'Hidden',
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
                    render() {
                        return (
                            <span style={{color: '#347EFF', cursor: 'pointer'}}>log</span>
                        )
                    }
                }, {
                    title: 'Action',
                    dataIndex: 'action',
                    render(text, record) {
                        const menu = (
                            <Menu>
                                <Menu.Item key="1">
                                    <div onClick={() => {}}>Restart</div>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="2">
                                    <div onClick={() => {}}>Delete</div>
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
                    console.log(values)
                    let job;
                    if(values.gpus === 0) {
                        job = {
                            jobname: values.jobname,
                            // git: values.git,
                            commit: values.commitId,
                            autoRestart: true,
                            image: values.image,
                            command: values.command
                        }
                    }else {
                        job = {
                            jobname: values.jobname,
                            git: values.git,
                            commit: values.commitId,
                            autoRestart: true,
                            image: values.image,
                            command: values.command,
                            gpu: values.gpus
                        }
                    }
                    console.log(job)
                    createJob(job);
                }else {
                    console.log({
                        specs_text: yamlConfig
                    })
                    createJob({
                        specs_text: yamlConfig
                    });
                }
            }
        });
        this.setState({
            visible: false
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

        // const source = new EventSource(`http://192.168.1.17:5000/test-sse`);
        // source.addEventListener('close', ev => {
        //     source.close();
        // }, false);

        // 获取username和data
        
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
                        initialValue: true,
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
                    {getFieldDecorator('commitId', {
                        rules: [{ required: true}]
                    })(
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
                    mode="java"
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
                        <Table 
                            columns={columns} 
                            dataSource={this.state.data}
                            rowKey="name"
                        />
                        <Button type="primary" style={{position: 'relative', top: '-50px'}} onClick={() => {this.setState({visible: true})}}>Create Job</Button>

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
            </div>
        )
    }
}

export default Form.create()(AppJob);