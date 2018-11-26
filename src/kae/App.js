import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import {Router, Switch, Route, Redirect} from 'react-router-dom';
import {Provider, connect} from 'react-redux';
import Radium from 'radium';

const { Header, Content, Footer } = Layout;

// import PageHeader from './header';
import store from './models/Store';

import AppList from './pages/AppListPage';
import AppDetail from './pages/AppDetailPage';
import JobList from './pages/JobListPage';
import AppAuditLog from './pages/AppAuditLogPage';

import './App.css';

class KaeApp extends React.Component {

  render() {
    return (
        <Provider store={store}>
          <Layout>
            <Header>
              <div className="logo" />
                <Menu
                  theme="dark"
                  mode="horizontal"
                  defaultSelectedKeys={['2']}
                  style={{ lineHeight: '64px' }}
                >
                  <Menu.Item key="1">nav 1</Menu.Item>
                  <Menu.Item key="2">nav 2</Menu.Item>
                  <Menu.Item key="3">nav 3</Menu.Item>
                </Menu>
            </Header>
            <div className="box-container">
              <div style={{margin: "0 15% 0 15%"}}>
                <Switch>
                  <Redirect from='/' to='/apps' />

                  <Route path="/apps" component={this.connectApi(AppList)} />
                  <Route path="/apps/:appName/detail" component={this.connectApi(AppDetail)} />
                  <Route path="/apps/:appName/audit_log" component={this.connectApi(AppAuditLog)} />
                  <Route path="/jobs" component={this.connectApi(JobList)} />
                </Switch>
              </div>
            </div>
          </Layout>
        </Provider>
    );
  }

  connectApi(Component) {
    return connect((state) => state.apiCalls)(Component);
  }

}

export default KaeApp;
