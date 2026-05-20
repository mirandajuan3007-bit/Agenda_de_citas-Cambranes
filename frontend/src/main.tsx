/**
 * @file main.tsx
 * Punto de entrada de React.
 *
 * Orden de inicialización:
 *   1. initStorage() — siembra localStorage con SEED_DATA si está vacío.
 *      Esto garantiza que al primer render ya existan datos (usuarios, citas, etc.).
 *   2. ReactDOM.createRoot() — monta la app en #root del index.html.
 *   3. AppProvider envuelve toda la app y expone el contexto global
 *      (estado, dispatch, currentUser, navigate, data).
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { App } from './App';
import './styles/globals.css';
import { initStorage } from './data/storage';

// Inicializar store antes del primer render
initStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
