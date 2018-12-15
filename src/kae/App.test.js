import React from 'react';
import ReactDOM from 'react-dom';
import KaeApp from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<KaeApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
