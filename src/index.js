import React from 'react';
import { render } from 'react-dom';

import KaeApp from './kae/App.js';

const routes = (
    <KaeApp />
);

render(routes, document.getElementById('root'));
