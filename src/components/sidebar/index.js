import React from 'react';
import {getCluster} from 'api';
import { Cascader } from 'antd';

import emitter from '../event.js';

import './index.css';

class Sidebar extends React.Component {
    constructor() {
        super();
        this.state = {
            defaultValue: [''],
            options: []
        }   
    }

    componentDidMount() {
        
    }

    componentWillMount(){
        getCluster().then(res => {
            // console.log(res);
            let clusters = [];
            res.map(d => {
                clusters.push({
                    code: d,
                    name: d
                })
            });
            this.setState({
                defaultValue: new Array(res[0]),
                options: clusters
            });
            emitter.emit('clusterChange', res[0]);
        })
        // console.log(this.state.defaultValue)
    }

    onChange(value) {
        // console.log(value[0]);
        emitter.emit('clusterChange', value[0]);
    }

    render() {
        const {options, defaultValue} = this.state;
        const appName = window.location.href.split('app=')[1];

        // console.log(options, defaultValue)
        return (
            <div id="sidebar">
                {appName ? 
                    <div>
                        <p><strong>appName:</strong></p>
                        <p style={{marginLeft: '20px'}}>{appName}</p>
                    </div>
                 : ''}
                <p><strong>Cluster</strong></p>
                <Cascader 
                    size="small"
                    placeholder="Select cluster"
                    allowClear={false}
                    style={{width: '80%', marginLeft: '20px'}}
                    filedNames={{ label: 'name', value: 'code' }} 
                    options={options} 
                    onChange={this.onChange.bind(this)}
                />
            </div>
        )
    }
}

export default Sidebar;