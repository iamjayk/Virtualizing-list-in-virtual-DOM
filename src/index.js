import React from 'react';
import { render } from 'react-dom';
import VirtualizedList from './components/VirtualizedList';

const root = document.getElementById('app');

render(<VirtualizedList/>, root);

if (module.hot) {
	module.hot.accept();
}