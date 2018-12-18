/*eslint-disable no-script-url*/
/*eslint-disable jsx-a11y/anchor-is-valid*/
import React from 'react';
import {Avatar, Layout, Row, Col, Dropdown, Menu, Icon, Button} from 'antd';

import { Link } from 'react-router-dom';
import {connect} from 'react-redux';

import './index.css';
import {getRequestFromProps} from '../../models/Utils';
import {baseLoginUrl} from '../../config';
import {showRegisterAppModal} from "../RegisterAppModal";
import {showCreateJobModal} from "../CreateJobModal";
import * as UserApi from "../../models/apis/User";
import {processApiResult} from "../../Utils";

const { Header} = Layout;
class PageHeader extends React.Component {

  constructor() {
    super();

    this.state = {};
  }
  componentDidMount() {
    let hasjob = window.location.href.indexOf('job') !== -1;
    if(!hasjob) {
      this.setState({
        selectedKeys: ['1']
      })
    }else {
      this.setState({
        selectedKeys: ['2']
      })
    }
  }

  handleChangeMenu = (item, key, selectedKeys) => {
    this.setState({
      selectedKeys: [item.key]
    })
  }

  handleLogin = () => {
    const loginUrl = `${baseLoginUrl}?next=${window.location.href}`;
    window.location.href = loginUrl;
  }

  handleLogout = () => {
    processApiResult(UserApi.logout(), "Logout")
      .then(data => {
        window.location.reload();
      }).catch(e => {});
  }

  clickKAE = (e) => {
    this.setState({
      selectedKeys: ['1']
    })
  }

  render() {
    const request = getRequestFromProps(this.props, 'GET_CURRENT_USER_REQUEST');
    let currentUser = null,
      selectedKeys = this.state.selectedKeys? this.state.selectedKeys: ["1"];
    if (request.statusCode === 200) {
      currentUser = request.data;
    }
    const addMenu = (
      <Menu>
        <Menu.Item>
          <a target="_blank" rel="noopener noreferrer" onClick={showRegisterAppModal}>Create App</a>
        </Menu.Item>
        <Menu.Item>
          <a target="_blank" rel="noopener noreferrer" onClick={showCreateJobModal}>Create Job</a>
        </Menu.Item>
      </Menu>
    );

    const userMenu = (
      <Menu>
        <Menu.Item>
          <div><Icon type="user" /> {currentUser? currentUser.nickname: ""}</div>
        </Menu.Item>
        <Menu.Item>
          <a target="_blank" rel="noopener noreferrer" onClick={this.handleLogout}><Icon type="poweroff" /> 退出</a>
        </Menu.Item>
      </Menu>
    );
    let userContent = currentUser? (
      <div className="user">
        <Dropdown overlay={userMenu}>
          <Avatar src={currentUser.avatar} alt={currentUser.nickname} />
        </Dropdown>
      </div>
    ): (
      <div className="user"><Button onClick={this.handleLogin}>登录<Icon type="login" /></Button></div>
    );
    return (
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', height:'48px' }}>
      <Row>
        <Col span={2}>
        <div className="logo" onClick={this.clickKAE}><Link to={`/`}>KAE</Link></div>
        </Col>
      <Col span={18}>
        <Menu
          mode="horizontal"
          selectedKeys={selectedKeys}
          onSelect={this.handleChangeMenu}
          style={{ lineHeight: '48px' }}
        >
          <Menu.Item key="1">
            <Link to={`/`}>App</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to={`/jobs`}>Jobs</Link>
          </Menu.Item>
        </Menu>
        </Col>
        <Col span={4}>
          <div style={{float: 'left'}}>
          <Dropdown overlay={addMenu}>
            <Button className="ant-dropdown-link" href="javascript:;">
             <Icon type="plus" /> <Icon type="down" />
            </Button>
          </Dropdown>
          </div>
          {userContent}
        </Col>
        </Row>
      </Header>
    )
  }
}

export default connect((state) => state.apiCalls)(PageHeader);
