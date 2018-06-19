import React from 'react';
import { Divider, Icon, Button, Modal } from 'antd';
import { appList, getUserId } from 'api';
import { Link } from 'react-router-dom';
import './index.css';

class Header extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false,
            hasLogin: false,
            visible: false,
            url: '',
            username: ''
        }
    }

    componentDidMount() {
        const app = document.getElementById('app');
        const job = document.getElementById('job');
        // 判断是否含有app/job -> 初始化class
        let hasjob = window.location.href.indexOf('job') !== -1
        if(!hasjob) {
            app.parentNode.className = 'on';
        }else {
            job.parentNode.className = 'on';
        }

        appList()
        .then(res => {
            if(res) {
                getUserId().then(res => {
                    this.setState({
                        username: res.nickname,
                        hasLogin: true,
                    })
                });
            }
        })
        .catch(err => {
            if(err.response.status === 403) {
                this.setState({
                    visible: true,
                    url: err.response.data.error
                })
            }
        });
    }

    handleVisible() {
        this.setState({
            visible: true
        })
    }

    handleLogin() {
        this.setState({
            loading: true,
        });
        setTimeout(() => {
            this.setState({ loading: false, visible: false });
        }, 2000);

        // 测试地址
        const testUrl = process.env.NODE_ENV === 'production' ? '' : 'http://192.168.1.17:5000'

        window.location.href = testUrl + this.state.url;
    }

    handleCancel() {
        this.setState({
            visible: false,
        });
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
        return (
            <div className="headerStyle">
                <div className="container">
                    <div className="logo" onClick={this.clickKAE.bind(this)}><Link to={`/`}>KAE</Link></div>
                    <div className="menuList" onClick={this.classChange.bind(this)}>
                        <div><Link to={`/`} id="app">App</Link></div>
                        <div><Link to={`/jobs`} id="job">Jobs</Link></div>
                    </div>
                    { this.state.hasLogin ? <div className="login">{this.state.username}</div> : <div className="login"><Button onClick={this.handleVisible.bind(this)}>登录<Icon type="login" /></Button></div> }
                </div>
                <Modal
                    title="您未登录"
                    visible={this.state.visible}
                    onOk={this.handleLogin.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                    footer={[
                        <Button key="back" onClick={this.handleCancel.bind(this)}>取消</Button>,
                        <Button key="login" type="primary" loading={this.state.loading} onClick={this.handleLogin.bind(this)}>
                            登录
                        </Button>,
                    ]}
                >
                    <p>点击登录跳转到授权页面...</p>
                </Modal>
            </div>
        )
    }
}

export default Header;