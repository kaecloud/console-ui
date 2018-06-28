import React from 'react';
import {getCluster} from 'api';
import { Menu, Icon } from 'antd';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

import './index.css';

class Sidebar extends React.Component {
    constructor() {
        super();
        this.state = {
            clusters: []
        }   
    }

    componentDidMount() {
        getCluster().then(res => {
            console.log(res);
            this.setState({
                clusters: res
            })
        })
    }

    render() {
        const {clusters} = this.state;
        let arr = [];
        clusters.forEach((c, index) => {
            arr.push(<Menu.Item key={index} onClick={this.props.handleClick}>{c}</Menu.Item>)
        });

        return (
            <div id="sidebar">
                <Menu
                    defaultSelectedKeys={['0']}
                    defaultOpenKeys={['sub1']}
                    style={{ width: '100%', border: 'none', marginTop: '20px' }}
                    mode="inline"
                >
                    <SubMenu key="sub1" title={<span><Icon type="appstore" /><span>Cluster</span></span>}>
                        {arr}
                    </SubMenu>
                </Menu>
            </div>
        )
    }
}

export default Sidebar;