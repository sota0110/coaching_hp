import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createPageApp } from './PageApp';
import { pageRoute } from './paths';
import './design.css';
import './renewal.css';

const root = document.getElementById('root');
const data = document.getElementById('page-content');
const initialContent = data ? JSON.parse(data.textContent) : null;
const App = createPageApp(pageRoute(window.location.pathname));
const page = <App initialContent={initialContent}/>;

if (root.hasChildNodes()) hydrateRoot(root, page);
else createRoot(root).render(page);
