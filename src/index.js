import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';

import KaeApp from './kae/App.js';

const routes = (
    <Router>
        <KaeApp />
    </Router>
);

render(routes, document.getElementById('root'));
