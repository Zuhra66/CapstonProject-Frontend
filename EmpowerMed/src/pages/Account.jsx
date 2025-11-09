// src/pages/Account.jsx
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useAuthFetch from '../hooks/useAuthFetch';

export default function Account() {
  const { user, isAuthenticated } = useAuth0();
  const authFetch = useAuthFetch();
  const [appProfile, setAppProfile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const p = await authFetch('/api/profile'); 
        setAppProfile(p);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h2>Account</h2>
      <h3>Auth0 profile</h3>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      <h3>Application profile</h3>
      {appProfile ? <pre>{JSON.stringify(appProfile, null, 2)}</pre> : <p>Loading app profile...</p>}
    </div>
  );
}
