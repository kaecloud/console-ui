import React from 'react';
import {getCluster} from 'api';
import { Cascader, Menu, Dropdown, Icon, message } from 'antd';

import emitter from '../event.js';

import './index.css';

class Sidebar extends React.Component {
    constructor() {
        super();
        this.state = {
            nowCluster: '',
            defaultValue: [''],
            options: (<Menu onClick={this.onClick}></Menu>)
        }   
        this.onClick = this.onClick.bind(this);
    }

    componentDidMount() {
        
    }

    componentWillMount(){
        getCluster().then(res => {
            let clusters = [];
            res.map(d => {
                clusters.push(
                    <Menu.Item key={d}>{d}</Menu.Item>
                )
            });
            const options = (
                <Menu onClick={this.onClick}>
                    {clusters}
                </Menu>
            );
            this.setState({
                nowCluster: res[0],
                options: options
            })
            emitter.emit('clusterChange', res[0]);
        })
        // console.log(this.state.defaultValue)
    }

    onClick(value) {
        this.setState({
            nowCluster: value.key
        });
        // console.log(value)
        emitter.emit('clusterChange', value.key);
    }

    render() {
        const {options, nowCluster} = this.state;
        const name = window.location.href.split('app=')[1];
        return (
            <div id="sidebar">
                {name ? 
                    <div>
                        <p><strong>appName:</strong></p>
                        <p style={{marginLeft: '20px'}}>{name.split('&cluster=')[0]}</p>
                    </div>
                 : ''}
                <p><strong>Cluster:</strong></p>
                <Dropdown overlay={options}>
                    <div style={{marginLeft: '20px',borderBottom: '1px solid #ccc', width: '86px', cursor: 'pointer'}}>
                        {nowCluster} <Icon type="down" />
                    </div>
                </Dropdown>
            </div>
        )
    }
}

export default Sidebar;