import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx';

const root = createRoot(document.getElementById('root'));

const onRedirectCallback = (appState) => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        audience={import.meta.env.VITE_AUTH0_AUDIENCE}
        authorizationParams={{
          redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI,
          scope: 'openid profile email offline_access',
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
        onRedirectCallback={onRedirectCallback}
      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);
