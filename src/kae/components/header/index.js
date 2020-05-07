/*eslint-disable no-script-url*/
/*eslint-disable jsx-a11y/anchor-is-valid*/
import React from 'react';
import {Avatar, Layout, Row, Col, Dropdown, Menu, Icon, Button} from 'antd';

import { Link } from 'react-router-dom';
import {connect} from 'react-redux';

import './index.css';
import {showRegisterAppModal} from "../RegisterAppModal";

const { Header} = Layout;
class PageHeader extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
    };
    this.props.keycloak.loadUserInfo().then(userInfo => {
      this.setState({userInfo: userInfo});
    });
  }
  componentDidMount() {
  }

  handleLogin = () => {
    this.props.keycloak.loadUserInfo().then(userInfo => {
      this.setState({userInfo: userInfo});
    });
  }

  handleLogout = () => {
    this.props.keycloak.logout();
    window.location.reload();
  }

  render() {
    let currentUser = this.state.userInfo;
    const addMenu = (
      <Menu>
        <Menu.Item>
          <a target="_blank" rel="noopener noreferrer" onClick={showRegisterAppModal}>Create App</a>
        </Menu.Item>
      </Menu>
    );

    const userMenu = (
      <Menu>
        <Menu.Item>
          <div><Icon type="user" /> {currentUser? currentUser.name: ""}</div>
        </Menu.Item>
        <Menu.Item>
          <a target="_blank" rel="noopener noreferrer" onClick={this.handleLogout}><Icon type="poweroff" /> 退出</a>
        </Menu.Item>
      </Menu>
    );
    let userContent = currentUser? (
      <div className="user">
        <Dropdown overlay={userMenu}>
        <Avatar size="large"
          style={{
            color: '#f56a00',
            backgroundColor: '#fde3cf',
          }}
        >
          {currentUser.given_name}
        </Avatar>
        </Dropdown>
      </div>
    ): (
      <div className="user"><Button onClick={this.handleLogin}>登录<Icon type="login" /></Button></div>
    );
    return (
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', height:'48px' }}>
      <Row>
        <Col span={2}>
        <div className="logo"><Link to={`/`}>KAE</Link></div>
        </Col>
        <Col span={4} offset={18}>
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
    );
  }
}

export default connect((state) => state.apiCalls)(PageHeader);
