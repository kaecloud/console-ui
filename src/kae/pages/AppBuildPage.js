import React from 'react';
import {Link} from 'react-router-dom';
import { Layout, Breadcrumb, Button, Select, Divider } from 'antd';

import * as AppActions from '../models/actions/Apps';
import { getRequestFromProps } from '../models/Utils';
import {setArg, processApiResult, getNowCluster, getClusterNameList} from '../Utils';
import * as AppApi from '../models/apis/Apps';
import {baseWsUrl} from '../config';

const {Content} = Layout;
const Option = Select.Option;

class AppBuild extends React.Component {
  constructor() {
    super();
    this.alreadyInitialized = false;
    this.state={
      ws: null,
      buildOutput: ""
    };

  }

  componentDidMount() {
    let appName = this.getAppName();

    this.buildApp();
  }

  componentWillUnmount() {
    const {ws} = this.state;

    if (ws) {
      ws.close();
    };
    this.setState({
      ws: null
    });
  }

  buildApp() {
    let self = this,
      appName = this.getAppName(),
      tag = this.getTag();
    const ws = new WebSocket(`${baseWsUrl}/api/v1/ws/app/${appName}/build`);
    ws.onopen = function(evt) {
      ws.send(`{"tag": "${tag}"}`);
    };
    let outputs = [];
    let phase = null;
    ws.onmessage = function(evt) {
      // ignore heartbeart message
      if (evt.data === "PONG") {
        return;
      }
      let data = JSON.parse(evt.data);
      if (! data.success) {
        outputs.push(<p key={data.error}>{data.error}</p>)
      } else {
        if (phase !== data['phase']) {
          outputs.push(<p>***** PHASE {data.phase}</p>);
          phase = data['phase'];
        }
        if (data.phase.toLowerCase() === "pushing") {
          let raw_data = data['raw_data'];
          if (raw_data.id && raw_data.status) {
            outputs.push(<p>{raw_data.id}: {raw_data.status}</p>);
          } else if (raw_data.digest) {
            outputs.push(<p>{raw_data.status}: digest: {raw_data.digest} size: {raw_data.size}</p>);
          } else {
            outputs.push(<p>{JSON.stringify(data)}</p>);
          }
        } else {
          outputs.push(<p>{data.msg}</p>);
        }
      }
      self.setState({buildOutput: outputs});
    };

    ws.onclose = function(evt) {
      // update release data
      if (phase.toLowerCase() !== "finished") {
        outputs.push(<p style={{color: 'red'}}>Build terminate prematurely </p>);
      } else {
        outputs.push(<p>Build finished successfully</p>);
      }
      self.setState({buildOutput: outputs});
    };
  }

  handleKill = () => {
    let appName = this.getAppName();

    processApiResult(AppApi.killBuildTask(appName), 'KillBuildTask')
      .then(data => {
      }).catch(v => {});
  }

  render() {
    let appName = this.getAppName(),
      tag = this.getTag();

    return (
      <Content>
        <h2>Build Output(tag: {tag})</h2>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>
            <Link to={`/`}>Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/apps/${appName}/detail?cluster=`}>App</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Entry</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{background: '#fff', padding: '20px'}}>

        <Button type="primary" style={{zIndex: '9', marginBottom: '20px'}}
                onClick={this.handleKill}>Kill</Button>
        <div style={{background:'#000', padding: '15px', color: '#c4c4c4'}}>
          <pre>{this.state.buildOutput}</pre>
        </div>
        </div>
      </Content>
        );
 }

 getAppName(props = this.props) {
    return props.match.params.appName;
  }

  getTag(props = this.props) {
    return props.match.params.tag;
  }

}

export default AppBuild;
