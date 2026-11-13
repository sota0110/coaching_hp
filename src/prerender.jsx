import React from 'react';
import { renderToString } from 'react-dom/server';
import { createPageApp } from './PageApp';

export function renderPage(route, content) {
  const App = createPageApp(route);
  return renderToString(<App initialContent={content}/>);
}
