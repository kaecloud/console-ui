import React from 'react';

import Header from './header';
// import Nav from './nav';
import Sidebar from './sidebar';
import Pages from './pages';

import './App.css';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            nowCluster: ''
        }
    }

    handleClick(e) {
        let nowCluster = e.item.props.children
        this.setState({
            nowCluster: nowCluster
        })
    }

    render() {
        const {nowCluster} = this.state;
        return (
            <div>
                <Header />
                {/* <Nav /> */}
                <Sidebar handleClick={this.handleClick.bind(this)}/>
                <Pages nowCluster={nowCluster}/>
            </div> 
        )
    }
}

export default App;