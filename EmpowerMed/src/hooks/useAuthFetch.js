// src/hooks/useAuthFetch.js
import { useAuth0 } from '@auth0/auth0-react';

export default function useAuthFetch() {
  const { getAccessTokenSilently } = useAuth0();
  const apiBase = import.meta.env.VITE_API_URL;

  async function authFetch(path, opts = {}) {
    const url = `${apiBase}${path}`;
    const options = {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        'Content-Type': opts.body ? 'application/json' : opts.headers?.['Content-Type'] || 'application/json'
      }
    };

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      });

      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      };

      // do NOT include credentials unless your backend explicitly uses cookie sessions
      const response = await fetch(url, options);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed (${response.status}): ${text}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) return await response.json();
      return await response.text();
    } catch (err) {
      console.error('authFetch error', err);
      throw err;
    }
  }

  return authFetch;
}
