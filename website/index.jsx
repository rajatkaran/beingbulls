import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/app.jsx'; // go up one level, then into src
import './index.css'; // this CSS file will be in utils/

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
