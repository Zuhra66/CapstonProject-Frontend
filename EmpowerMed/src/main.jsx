// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx';

const root = createRoot(document.getElementById('root'));

// Remove automatic redirect callback - let the navbar handle login
const onRedirectCallback = (appState) => {
  // Only handle if there's a specific returnTo, otherwise stay on current page
  if (appState?.returnTo) {
    window.history.replaceState(
      {},
      document.title,
      appState.returnTo
    );
  }
  // Otherwise, do nothing - user stays on current page
};

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin, // Use current page
        scope: 'openid profile email offline_access'
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);