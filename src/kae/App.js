import React from 'react';
import {HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import {Provider, connect} from 'react-redux';
import {Layout} from 'antd';
import Keycloak from 'keycloak-js';

/* import Radium from 'radium';*/

import PageHeader from './components/header';
import store from './models/Store';
import * as AppActions from './models/actions/Apps';

import AppList from './pages/AppListPage';
import AppDetail from './pages/AppDetailPage';
import AppAuditLog from './pages/AppAuditLogPage';
import AppConfigMap from './pages/AppConfigMapPage';
import AppSecret from './pages/AppSecretPage';
import AppABTesting from './pages/AppABTestingPage';
import AppPodEntry from './pages/AppPodEntryPage';
import AppBuild from './pages/AppBuildPage';

import './App.css';

class KaeApp extends React.Component {

  constructor() {
    super();
    this.state = { keycloak: null, authenticated: false };

  }

  componentDidMount() {
    const keycloak = Keycloak('/keycloak.json');
    keycloak.init({onLoad: 'login-required'}).then(authenticated => {
      this.setState({ keycloak: keycloak, authenticated: authenticated });
      localStorage.setItem('user-token', keycloak.token);

      store.dispatch(AppActions.listCluster());
    });
  }

  render() {
    if (this.state.keycloak) {
      if (this.state.authenticated) {
        return (
            <Provider store={store}>
              <HashRouter>
                <Layout>
            <PageHeader keycloak={this.state.keycloak}/>
                  <div className="box-container">
                    <div style={{margin: "0 15% 0 15%"}}>
                      <Switch>

                        <Route path="/apps/:appName/detail" component={this.connectApi(AppDetail)} />
                        <Route path="/apps/:appName/audit_logs" component={this.connectApi(AppAuditLog)} />
                        <Route path="/apps/:appName/configmap" component={this.connectApi(AppConfigMap)} />
                        <Route path="/apps/:appName/secret" component={this.connectApi(AppSecret)} />
                        <Route path="/apps/:appName/abtesting" component={this.connectApi(AppABTesting)} />
                        <Route path="/apps/:appName/cluster/:cluster/pod/:podName/entry" component={this.connectApi(AppPodEntry)} />
                        <Route path="/apps/:appName/tag/:tag/build" component={this.connectApi(AppBuild)} />

                        <Route path="/apps" component={this.connectApi(AppList)} />

                        <Redirect from='/' to='/apps' />
                      </Switch>
                    </div>
                  </div>
                </Layout>
              </HashRouter>
            </Provider>
        );
      } else {
        return (<div>Unable to authenticate!</div>);
      }
    }
    return (
        <div>Initializing Keycloak...</div>
    );
  }

  connectApi(Component) {
    return connect((state) => state.apiCalls)(Component);
  }
}

export default KaeApp;
