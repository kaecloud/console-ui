import React from 'react';
import { Divider, Icon, Button, Modal } from 'antd';
import { Link } from 'react-router-dom';
import {connect} from 'react-redux';

import './index.css';
import {getRequestFromProps} from '../../models/Utils';
import {baseLoginUrl} from '../../config';

class PageHeader extends React.Component {

  constructor() {
    super();
  }

  componentDidMount() {
    const app = document.getElementById('app');
    const job = document.getElementById('job');
    // 判断是否含有app/job -> 初始化class
    let hasjob = window.location.href.indexOf('job') !== -1;
    if(!hasjob) {
      app.parentNode.className = 'on';
    }else {
      job.parentNode.className = 'on';
    }
  }

  handleLogin() {
    const loginUrl = `${baseLoginUrl}?next=${window.location.href}`;
    window.location.href = loginUrl;
  }

  classChange(e){
    if(e.target.localName === 'a') {
      let div = e.target.parentNode.parentNode.childNodes;
      div.forEach(el => {
        el.className = '';
      });
      e.target.parentNode.className = 'on';
      // console.log(e.target);
    }
  }

  clickKAE(e) {
    const app = document.getElementById('app');
    if(e.target.localName === 'a') {
      let div = e.target.parentNode.nextSibling.childNodes;
      div.forEach(el => {
        el.className = '';
      });
      app.parentNode.className = 'on';
    }
  }

  render() {
    const request = getRequestFromProps(this.props, 'GET_CURRENT_USER_REQUEST');
    let currentUser = null;
    if (request.statusCode === 200) {
      currentUser = request.data;
    }
    return (

            <div className="headerStyle">
                <div className="container">
                    <div className="logo" onClick={this.clickKAE.bind(this)}><Link to={`/`}>KAE</Link></div>
                    <div className="menuList" onClick={this.classChange.bind(this)}>
                        <div><Link to={`/`} id="app">App</Link></div>
                        <div><Link to={`/jobs`} id="job">Jobs</Link></div>
                    </div>
        {
          currentUser? <div className="login">{currentUser.nickname}</div>: <div className="login"><Button onClick={this.handleLogin}>登录<Icon type="login" /></Button></div>
        }
                </div>
            </div>
    )
  }
}

export default connect((state) => state.apiCalls)(PageHeader);
