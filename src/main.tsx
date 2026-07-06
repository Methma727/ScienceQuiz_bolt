import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const diag = document.getElementById('diag');
if (diag) diag.textContent = 'JS executed';

window.addEventListener('error', (e) => {
  console.error('Global error caught:', e.error || e.message);
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="padding:2rem;color:#e94560;font-family:sans-serif">
      <h1>Something went wrong</h1>
      <pre style="color:#a0a0a0;white-space:pre-wrap">${e.error?.stack || e.message || 'Unknown error'}</pre>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
