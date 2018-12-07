import React from 'react';
import {Link} from 'react-router-dom';
import { Collapse, Table, Icon, Layout, Breadcrumb, Button, Select, Divider } from 'antd';
import {
  Terminal
} from 'xterm';
import 'xterm/dist/xterm.css';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as attach from 'xterm/lib/addons/attach/attach';

import * as AppActions from '../models/actions/Apps';
import { getRequestFromProps } from '../models/Utils';
import {getNowCluster, getArg} from './Utils';
import {baseWsUrl} from '../config';

const Panel = Collapse.Panel;
const {Content} = Layout;
const Option = Select.Option;

Terminal.applyAddon(fit);
Terminal.applyAddon(attach);

var printInfo = (data) => {
  return '\x1B[32m>>> ' + data + '\x1B[0m';
};

var printError = (data) => {
  return '\x1B[31m>>> ' + data + '\x1B[0m';
};

class AppPodEntry extends React.Component {
  constructor() {
    super();
    this.state={
      term: null,
      ws: null
    };

  }

  componentDidMount() {
    const {dispatch} = this.props;

    let appName = this.props.match.params.appName,
        cluster = getNowCluster(this.props),
        podName = getArg('pod');
    dispatch(AppActions.getDeployment(appName, cluster));

  }

  componentWillUnmount() {
    const {term, ws} = this.state;

    term.destroy();
    if (ws) {
      ws.close();
    };
    this.setState({
      term: null,
      ws: null
    });
  }

  componentWillReceiveProps(nextProps) {
    const request = getRequestFromProps(nextProps, 'GET_APP_DEPLOYMENT_REQUEST');
    let dp = null;
    if (request.statusCode === 200) {
      dp = request.data;
    }
    let containers = [];
    if (dp) {
      containers = dp.spec.template.spec.containers.map(cnt => cnt.name);
    }
    let { activeContaner } = this.state;
    if (! activeContaner) {
      activeContaner = containers.length > 0? containers[0]: null;
    }
    this.setState({
      containers: containers,
      activeContaner: activeContaner
    });
    this.handleReplay(activeContaner);
  }

  handleReplay(container) {
    let appName = this.props.match.params.appName,
        cluster = getNowCluster(this.props),
        podName = getArg('pod');

    let {term, ws} = this.state;
    if (ws) {
      ws.close();
    }
    if(term) {
      term.destroy();
    }
    term = new Terminal({
      cursorBlink: true
    });
    term.open(document.getElementById('term'));
    term.fit();
    term.writeln(printInfo("welcome to use docker web terminal!"));
    console.log('hahah');

    ws = new WebSocket(`${baseWsUrl}/api/v1/ws/app/${appName}/entry`);
    let containerInfo = {
      cluster: cluster,
      podname: podName,
      namespace: "kae-app"
    };
    if (container) {
      containerInfo.container = container;
    }
    ws.onopen = function(evt) {
      ws.send(JSON.stringify(containerInfo));
    };
    ws.onclose = function(evt) {
      // update release data
      console.log("entry socket closed");
      term.writeln("\nclosed. Thank you for use!");
    };
    term.attach(ws);

    this.setState({
      term: term,
      ws: ws
    });
  }

  handleReconnect() {
    let { activeContaner } = this.state;
    this.handleReplay(activeContaner);
  }

  handleChangeContainer(newContainer) {
    this.setState({
      activeContaner: newContainer
    });
    this.handleReplay(newContainer);
  }

  render() {
    let data = [],
        appName = this.props.match.params.appName,
        cluster = getNowCluster(this.props),
        podName = getArg('pod');

    let {containers, activeContaner} = this.state;
    if (!containers) {
      containers = [];
    }

    return (
      <Content>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>
            <Link to={`/`}>Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/apps/${appName}/detail?cluster=${cluster}`}>App</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Entry</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{background: '#fff', padding: '20px'}}>

        <Button type="primary" style={{zIndex: '9', marginBottom: '20px'}}
                onClick={this.handleReconnect.bind(this)}>Reconnect</Button>

        <Divider type="vertical" />

      Container: <Select value={activeContaner} style={{ width: 100}}
      onChange={this.handleChangeContainer.bind(this)}>
        { containers.map(name => <Option key={name}>{name}</Option>) }
      </Select>
          <div id="term"></div>
        </div>
      </Content>
        );
 }

 getAppName(props = this.props) {
    return props.match.params.appName;
  }

}

export default AppPodEntry;
