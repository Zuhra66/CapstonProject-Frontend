// src/hooks/useAuthFetch.js
import { useAuth0 } from '@auth0/auth0-react';

export default function useAuthFetch() {
  const { getAccessTokenSilently } = useAuth0();
  const apiBase = import.meta.env.VITE_API_BASE_URL; // ensure this points to your backend

  async function authFetch(path, opts = {}) {
    const url = `${apiBase}${path}`;
    const options = {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        'Content-Type': opts.body ? 'application/json' : 'application/json',
      },
    };

    const token = await getAccessTokenSilently({
      authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
    });

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Request failed (${response.status}): ${text}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return await response.json();
    return await response.text();
  }

  return authFetch;
}
