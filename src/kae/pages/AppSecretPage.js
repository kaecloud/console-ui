import React from 'react';
import {Link} from 'react-router-dom';
import {
  Button, Select, Form, Layout, Breadcrumb
} from 'antd';
import AceEditor from 'react-ace';

import * as AppApi from '../models/apis/Apps';
import * as AppActions from '../models/actions/Apps';
import {getRequestFromProps } from '../models/Utils';
import {setArg, processApiResult, getNowCluster, getClusterNameList} from './Utils';

const FormItem = Form.Item;
const {Content} = Layout;

class AppSecret extends React.Component {

  constructor() {
    super();
    this.alreadyInitialized = false;
    this.state = {
      value: ""
    };
  }

  refreshIfNedded(nowCluster) {
    if (nowCluster) {
      if (this.alreadyInitialized === false ) {
        this.alreadyInitialized = true;
        this.refreshSecret(nowCluster);
      }
    }
  }

  componentDidMount() {
    let cluster = getNowCluster(this.props);
    this.refreshIfNedded(cluster);
  }

  componentWillReceiveProps(nextProps) {
    let secretReq = getRequestFromProps(nextProps, 'GET_APP_SECRET_REQUEST'),
      secretData = {},
      cluster = getNowCluster(nextProps);
    this.refreshIfNedded(cluster);

    if (secretReq.statusCode === 200) {
      secretData = secretReq.data;
    }
    let secretDataStr = JSON.stringify(secretData, undefined, 2);
    this.setState({
      value: secretDataStr
    });
  }

  changeCluster = (newCluster) => {
    setArg('cluster', newCluster);

    const {dispatch} = this.props;

    dispatch(AppActions.setCurrentCluster(newCluster));
    this.refreshSecret(newCluster);
  }

  submitForm(cluster_name, data) {
    let self = this,
      appName = this.getAppName();

    let params = {
      data: data,
      replace: true,
      cluster: cluster_name
    };
    processApiResult(AppApi.createSecret(appName, params), "Create or Update Secret")
      .then(data => {
        self.refreshSecret(cluster_name);
      }).catch(e => {});
  }

  onAceEditorChange(newValue) {
    this.setState({value: newValue});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    event.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let secretData = JSON.parse(this.state.value);
        this.submitForm(values.cluster_name, secretData);
      }
    });
  }

  refreshSecret(cluster) {
    const appName = this.getAppName();
    const {dispatch} = this.props;
    dispatch(AppActions.getSecret(appName, cluster));
  }

  render() {
    let self = this;
    const { getFieldDecorator } = this.props.form;

    const appName = this.getAppName();
    const cluster = getNowCluster(this.props);
    let clusterNameList = getClusterNameList(this.props);
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 }
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
          offset: 2
        },
      },
    };

    return (
      <Content style={{margin: '0 10%'}}>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>
            <Link to={`/`}>Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/apps/${appName}/detail`}>App</Link>
          </Breadcrumb.Item>
            <Breadcrumb.Item>Secret</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{padding: '10px', background: '#fff'}}>
        <h2>修改{appName}的Secret</h2>
        <div style={{padding: '10px'}}>
          <Form onSubmit={this.handleSubmit}>
              <FormItem
                  {...formItemLayout}
                  label="Cluster"
              >
                  {getFieldDecorator('cluster_name', {
                      initialValue: cluster
                  })(
                      <Select style={{width: 120}} onChange={this.changeCluster}>
                           { clusterNameList.map(name => <Select.Option key={name}>{name}</Select.Option>) }
                      </Select>
                  )}
              </FormItem>
        <div style={{height: '5px'}}></div>

        <FormItem
      {...formItemLayout}
      label="Data"
      >
        <AceEditor
          mode="json"
          value={this.state.value}
          theme="xcode"
          onChange={self.onAceEditorChange.bind(self)}
          name="json"
          fontSize={18}
          width="100%"
          height="500px"
          editorProps={{$blockScrolling: true}}
        />
        </FormItem>
        <FormItem
      {...tailFormItemLayout}
        >
          <Button type="primary" htmlType="submit" > Submit </Button>
        </FormItem>
      </Form>
        </div>
        </div>
        </Content>
        );
 }

 getAppName(props = this.props) {
    return props.match.params.appName;
  }

};

export default Form.create()(AppSecret);
