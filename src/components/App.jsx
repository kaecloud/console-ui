import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';

import PageHeader from './header';
// import Nav from './nav';
import Sidebar from './sidebar';
import Pages from './pages';

import './App.css';

class App extends React.Component {

    render() {
        return (
          <Layout>
            <PageHeader />
            {/* <Nav /> */}
            <div className="box-container">
               {/* <Sidebar/> */}
                <Pages/>
            </div>
           </Layout>
        )
    }
}

export default App;