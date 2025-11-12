import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'react-bootstrap';

export default function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <Button
      variant="outline-secondary"
      onClick={() => logout({ logoutParams: { returnTo: import.meta.env.VITE_FRONTEND_URL } })}
      style={{ width: '100%' }}
    >
      Log out
    </Button>
  );
}
