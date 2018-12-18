import React from 'react';
import {HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import {Provider, connect} from 'react-redux';
import {Layout} from 'antd';
/* import Radium from 'radium';*/

import PageHeader from './components/header';
import store from './models/Store';
import * as AppActions from './models/actions/Apps';

import AppList from './pages/AppListPage';
import AppDetail from './pages/AppDetailPage';
import JobList from './pages/JobListPage';
import AppAuditLog from './pages/AppAuditLogPage';
import AppConfigMap from './pages/AppConfigMapPage';
import AppSecret from './pages/AppSecretPage';
import AppABTesting from './pages/AppABTestingPage';
import AppPodEntry from './pages/AppPodEntryPage';

import './App.css';

class KaeApp extends React.Component {

  constructor() {
    super();
    store.dispatch(AppActions.listCluster());
    store.dispatch(AppActions.getCurrentUser());
  }

  render() {
    return (
        <Provider store={store}>
          <HashRouter>
            <Layout>
              <PageHeader />
              <div className="box-container">
                <div style={{margin: "0 15% 0 15%"}}>
                  <Switch>

                    <Route path="/apps/:appName/detail" component={this.connectApi(AppDetail)} />
                    <Route path="/apps/:appName/audit_logs" component={this.connectApi(AppAuditLog)} />
                    <Route path="/apps/:appName/configmap" component={this.connectApi(AppConfigMap)} />
                    <Route path="/apps/:appName/secret" component={this.connectApi(AppSecret)} />
                    <Route path="/apps/:appName/abtesting" component={this.connectApi(AppABTesting)} />
                    <Route path="/apps/:appName/cluster/:cluster/pod/:podName/entry" component={this.connectApi(AppPodEntry)} />

                    <Route path="/apps" component={this.connectApi(AppList)} />
                    <Route path="/jobs" component={this.connectApi(JobList)} />

                    <Redirect from='/' to='/apps' />
                  </Switch>
                </div>
              </div>
            </Layout>
          </HashRouter>
        </Provider>
    );
  }

  connectApi(Component) {
    return connect((state) => state.apiCalls)(Component);
  }
}

export default KaeApp;
