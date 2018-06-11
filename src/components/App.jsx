import React from 'react';

import Header from './header';
import Nav from './nav';
import Pages from './pages';

import './App.css';

class App extends React.Component {
    render() {
        return (
            <div>
                <Header />
                {/* <Nav /> */}
                <Pages />
            </div> 
        )
    }
}

export default App;