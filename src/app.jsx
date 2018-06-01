import React from 'react';

import Header from './components/header';
import Nav from './components/nav';
import Pages from './components/pages';

import './App.css';

class App extends React.Component {
    render() {
        return (
            <div>
                <Header />
                <Nav />
                <Pages />
            </div>
        )
    }
}

export default App;