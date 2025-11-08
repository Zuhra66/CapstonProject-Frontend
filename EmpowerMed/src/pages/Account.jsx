import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

export default function Account() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState(null);

  // Keep profile state in sync with Auth0 user
  useEffect(() => {
    if (isAuthenticated && user) {
      setProfile(user);
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="text-center mt-5">Please log in to view your account.</div>;
  }

  return (
    <div className="text-center mt-5">
      <h2>My Account</h2>
      <img
        src={profile?.picture || '/logo.png'}
        alt="Profile"
        style={{
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          margin: '20px 0',
          objectFit: 'cover',
        }}
      />
      <h4>{profile?.name || profile?.given_name || 'User'}</h4>
      <p>{profile?.email}</p>
    </div>
  );
}
