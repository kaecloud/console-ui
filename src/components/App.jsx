import React from 'react';

import Header from './header';
// import Nav from './nav';
import Sidebar from './sidebar';
import Pages from './pages';

import './App.css';

class App extends React.Component {

    render() {
        return (
            <div style={{height: "100%"}}>
                <Header />
                {/* <Nav /> */}
                <div className="box-container">
                    <Sidebar/>
                    <Pages/>
                </div>
            </div> 
        )
    }
}

export default App;