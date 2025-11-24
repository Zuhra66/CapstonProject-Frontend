// src/hooks/useAdminApi.js
import { useAuth0 } from '@auth0/auth0-react';

export function useAdminApi() {
  const { getAccessTokenSilently } = useAuth0();

  async function fetchAdminData() {
    const token = await getAccessTokenSilently();
    const res = await fetch('http://localhost:5000/admin/check', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch admin data');
    return res.json();
  }

  return { fetchAdminData };
}
