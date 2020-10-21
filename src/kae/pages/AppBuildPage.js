import React from 'react';
import {Link} from 'react-router-dom';
import { Layout, Breadcrumb, Button } from 'antd';

import {processApiResult} from '../Utils';
import * as AppApi from '../models/apis/Apps';
import {baseWsUrl} from '../config';

const {Content} = Layout;

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
    let outputs = [],
      phase = null,
      keyIdx = 0;
    ws.onmessage = function(evt) {
      // ignore heartbeart message
      if (evt.data === "PONG") {
        return;
      }
      let data = JSON.parse(evt.data);
      if (! data.success) {
        outputs.push(<p key={keyIdx++} style={{color: 'red'}}>{data.error}</p>)
      } else {
        if (phase !== data['phase']) {
          outputs.push(<p key={keyIdx++} style={{color: '#00d600'}}>***** PHASE {data.phase}</p>);
          phase = data['phase'];
        }
        outputs.push(<p key={keyIdx++}>{data.msg}</p>);
      }
      self.setState({buildOutput: outputs});
    };

    ws.onclose = function(evt) {
      // update release data
      if (phase.toLowerCase() !== "finished") {
        outputs.push(<p key={keyIdx++} style={{color: 'red'}}>Build terminate prematurely </p>);
      } else {
        outputs.push(<p key={keyIdx++}>Build finished successfully</p>);
      }
      self.setState({buildOutput: outputs});
    };

    this.setState({
      ws: ws
    });
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
          <Breadcrumb.Item>Build</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{background: '#fff', padding: '20px'}}>

        <Button type="primary" style={{zIndex: '9', marginBottom: '20px'}}
                onClick={this.handleKill}>Kill</Button>
        <div id="build-output" style={{background:'#000', padding: '15px', color: '#c4c4c4'}}>
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
