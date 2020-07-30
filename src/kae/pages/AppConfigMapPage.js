import React from 'react';
import {Link} from 'react-router-dom';

import {
  Button, Row, Col, Select, Form, Input,
  Checkbox, Layout, Breadcrumb, Modal
} from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

import * as AppApi from '../models/apis/Apps';
import * as AppActions from '../models/actions/Apps';
import {getRequestFromProps } from '../models/Utils';
import {processApiResult, getNowCluster, getClusterNameList, setArg} from '../Utils';

const FormItem = Form.Item;
const { TextArea } = Input;
const {Content} = Layout;

class AppConfigMap extends React.Component {

  constructor() {
    super();
    this.alreadyInitialized = false;
    this.state = {
      value: "",
      visible: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  refreshIfNedded(nowCluster) {
    if (nowCluster) {
      if (this.alreadyInitialized === false ) {
        this.alreadyInitialized = true;
        this.refreshConfigMap(nowCluster);
      }
    }
  }
  componentDidMount() {
    let nowCluster = getNowCluster(this.props);
    this.refreshIfNedded(nowCluster);
  }

  componentWillReceiveProps(nextProps) {
    let nowCluster = getNowCluster(nextProps),
      cmReq = getRequestFromProps(nextProps, 'GET_APP_CONFIGMAP_REQUEST'),
      cmData = {};
    this.refreshIfNedded(nowCluster);
    if (cmReq.statusCode === 200) {
      cmData = cmReq.data;
    }
    this.setState({
      value: cmData
    });
  }

  handleChangeCluster(newCluster) {
    const {dispatch} = this.props;
    setArg('cluster', newCluster);

    dispatch(AppActions.setCurrentCluster(newCluster));
    this.refreshConfigMap(newCluster);
  }

  submitForm(cluster_name, replace, cm_data) {
    let self = this,
      title = 'Create or Update ConfigMap',
      nowCluster = getNowCluster(this.props),
      appName = this.getAppName();

    let params = {
      replace: replace,
      data: cm_data,
      cluster: cluster_name
    };

    processApiResult(AppApi.createConfigMap(appName, params), title)
      .then(data => {
        self.refreshConfigMap(nowCluster);
        self.setState({
          visible: false
        });
      }).catch(e => {});
  }

  onAceEditorChange(newValue) {
    this.setState({value: newValue});
  }

  handleSubmit(event) {
    let self = this;
    event.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        let cmData = { };
        cmData[values.key] = values.data;
        self.submitForm(values.cluster_name, values.replace, cmData);
      }
    });
  }

  handleUpdate = () => {
    this.setState({
      visible: true
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false
    });
  }
  refreshConfigMap(cluster) {
    const appName = this.getAppName();
    const {dispatch} = this.props;
    dispatch(AppActions.getConfigMap(appName, cluster));
  }

  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 4
        },
      },
    };

    const { getFieldDecorator } = this.props.form;

    const appName = this.getAppName();
    const cluster = getNowCluster(this.props);
    let clusterNameList = getClusterNameList(this.props),
        currentJsxContent = [],
        newestJsxContent = [],
        current = this.state.value.current? this.state.value.current: {},
        newest = this.state.value.newest? this.state.value.newest:{};
    Object.entries(current).forEach(([key, value]) => {
      currentJsxContent.push(<div key={key}><h3>{key}</h3> <SyntaxHighlighter  style={docco}>
        {value}
      </SyntaxHighlighter>
                        </div>);
    });

    Object.entries(newest).forEach(([key, value]) => {
      newestJsxContent.push(<div key={key}><h3>{key}</h3> <SyntaxHighlighter  style={docco}>
                        {value}
                        </SyntaxHighlighter>
                        </div>);
    });


    return (
      <Content>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>
            <Link to={`/`}>Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/apps/${appName}/detail?cluster=${cluster}`}>App</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Config</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{background: '#fff', padding: '20px'}}>
          <Button type="primary" style={{zIndex: '9', marginBottom: '20px'}}
                  onClick={this.handleUpdate}>Update</Button>

          <Modal
            title= "修改config"
            width={760}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            footer={null}
          >
            <Form onSubmit={this.handleSubmit}>
              <FormItem
                {...formItemLayout}
                label="Cluster"
              >
                {getFieldDecorator('cluster_name', {
                    initialValue: cluster
                })(
                    <Select onChange={this.handleChangeCluster.bind(this)}>
                        { clusterNameList.map(name => <Select.Option key={name}>{name}</Select.Option>) }
                    </Select>
                )}
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="Key"
              >
                {getFieldDecorator('key', {
                  rules: [{required: true, message: 'Please input you config content'}]
                })(
                    <Input placeholder="the key name in configmap data" />
                )}
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="replace"
              >
                {getFieldDecorator('replace', {
                  valuePropName: 'checked',
                  initialValue: false,
                })(
                    <Checkbox />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="Data"
              >
                {getFieldDecorator('data', {
                    rules: [{required: true, message: 'Please input you config content'}]
                })(
                    <TextArea rows={8} />
                )}
              </FormItem>

              <FormItem
                {...tailFormItemLayout}
              >
                <Button type="primary" htmlType="submit" > Submit </Button>
              </FormItem>
            </Form>
          </Modal>
        </div>

        <Row justify="space-between" tyep="flex" style={{background: '#fff'}}>
          <Col span={12} style={{height: '100%'}}>
            <div style={{padding: '0px 20px', background: '#fff'}}>
              <h2>{appName}的适用于{cluster}集群的最新Config</h2>
              <div >
                {newestJsxContent}
              </div>
            </div>
          </Col>
          <Col span={12} style={{height: '100%'}}>
            <div style={{padding: '0px 20px', background: '#fff'}}>
              <h2>{appName}在{cluster}集群的当前生效的Config</h2>
              <div >
                {currentJsxContent}
              </div>
            </div>
          </Col>
        </Row>
      </Content>
        );
 }

 getAppName(props = this.props) {
    return props.match.params.appName;
  }

};

export default Form.create()(AppConfigMap);
