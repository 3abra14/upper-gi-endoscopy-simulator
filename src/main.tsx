import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  // Use a global variable to store the root instance for HMR
  const root = (window as any)._reactRoot || ReactDOM.createRoot(rootElement);
  (window as any)._reactRoot = root;
  root.render(<App />);
}
