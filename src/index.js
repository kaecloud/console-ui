import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';

import App from './App.jsx';

const routes = (
    <Router>
        <App />
    </Router>
)

render(routes, document.getElementById('root'));