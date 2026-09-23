import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';
import './styles/boutique.css';
import './styles/produits.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
