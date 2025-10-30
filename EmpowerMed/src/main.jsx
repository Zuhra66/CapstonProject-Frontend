import './styles/theme.css';
import './styles/layout.css';
import './styles/buttons.css';
import './styles/signup.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0ProviderWithConfig } from './auth/Auth0ProviderWithConfig.jsx';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Auth0ProviderWithConfig>
      <App />
    </Auth0ProviderWithConfig>
  </StrictMode>
);
