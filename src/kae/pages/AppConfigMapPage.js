import React from 'react';
import {Link} from 'react-router-dom';

import {
  Button, Row, Col, Select, Form, Input,
  Checkbox, Layout, Breadcrumb
} from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

import * as AppApi from '../models/apis/Apps';
import * as AppActions from '../models/actions/Apps';
import {getRequestFromProps } from '../models/Utils';
import {processApiResult, getNowCluster, getClusterNameList} from '../Utils';

const FormItem = Form.Item;
const { TextArea } = Input;
const {Content} = Layout;

class AppConfigMap extends React.Component {

  constructor() {
    super();
    this.alreadyInitialized = false;
    this.state = {
      value: ""
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
    let cmDataStr = JSON.stringify(cmData, undefined, 2);
    this.setState({
      value: cmDataStr
    });
  }

  handleChangeCluster(newCluster) {
    const {dispatch} = this.props;

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
      curVal = this.state.value? this.state.value: "";

    return (
      <Content>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>
            <Link to={`/`}>Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/apps/${appName}/detail`}>App</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Config</Breadcrumb.Item>
        </Breadcrumb>
        <Row gutter={5} justify="space-between" tyep="flex" style={{background: '#fff'}}>
          <Col span={12} style={{height: '100%'}}>
            <div style={{padding: '20px 10px', background: '#fff'}}>
              <h2>{appName}在{cluster}集群的当前Config</h2>
              <div >
                <SyntaxHighlighter language="json" style={docco}>
                  {curVal}
                </SyntaxHighlighter>
              </div>
            </div>
          </Col>
          <Col span={12} style={{background: '#fff'}}>
            <div style={{padding: '20px 10px'}}>
              <h2>修改{appName}在{cluster}集群的Config</h2>
              <div >
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
