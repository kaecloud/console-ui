import React from 'react';
import {Link} from 'react-router-dom';

import {
  Button, Select, Form, Layout, Breadcrumb
} from 'antd';
import AceEditor from 'react-ace';

import * as AppApi from '../models/apis/Apps';
import * as AppActions from '../models/actions/Apps';
import {getRequestFromProps } from '../models/Utils';
import {processApiResult, getNowCluster, getClusterNameList, setArg} from '../Utils';

const FormItem = Form.Item;
const {Content} = Layout;

class AppABTesting extends React.Component {

  constructor() {
    super();
    this.alreadyInitialized = false;
    this.state = {
      value: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentWillMount() {
  }

  refreshIfNedded(nowCluster) {
    if (nowCluster) {
      if (this.alreadyInitialized === false ) {
        this.alreadyInitialized = true;
        this.refreshABTesting(nowCluster);
      }
    }
  }

  componentDidMount() {
    let cluster = getNowCluster(this.props);
    this.refreshIfNedded(cluster);
  }

  componentWillReceiveProps(nextProps) {
    let abtestingReq = getRequestFromProps(nextProps, 'GET_APP_ABTESTING_REQUEST'),
      abtestingData = {},
      cluster = getNowCluster(nextProps);
    this.refreshIfNedded(cluster);

    if (abtestingReq.statusCode === 200) {
      abtestingData = abtestingReq.data;
    }
    let abtestingDataStr = JSON.stringify(abtestingData, undefined, 2);
    this.setState({
      value: abtestingDataStr
    });
  }

  changeCluster = (newCluster) => {

    setArg('cluster', newCluster);
    const {dispatch} = this.props;

    dispatch(AppActions.setCurrentCluster(newCluster));
    this.refreshABTesting(newCluster);
  }

  onAceEditorChange(newValue) {
    this.setState({value: newValue});
  }

  handleSubmit(event) {
    let self = this,
      title = 'Set A/B Testing rules',
      cluster = getNowCluster(this.props),
      appName = this.getAppName();

    event.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let rules = JSON.parse(this.state.value);

        processApiResult(AppApi.setABTestingRules(appName, values.cluster_name, rules), title)
          .then(data => {
            self.refreshABTesting(cluster);
          }).catch(e => {});
      }
    });
  }

  refreshABTesting(cluster) {
    const appName = this.getAppName();
    const {dispatch} = this.props;
    dispatch(AppActions.getABTestingRules(appName, cluster));
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
            <Link to={`/apps/${appName}/detail?cluster=${cluster}`}>App</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>ABTesting</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{padding: '10px', background: '#fff'}}>
        <h2>修改{appName}的A/B Testing规则</h2>
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

export default Form.create()(AppABTesting);
