// src/pages/Login.jsx
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import SocialButton from '../components/SocialButton';

export default function Login() {
  const { loginWithRedirect, isLoading } = useAuth0();

  useEffect(() => {
    const timer = setTimeout(() => {
      loginWithRedirect(); // default is login
    }, 100);
    return () => clearTimeout(timer);
  }, [loginWithRedirect]);

  const handleGoogleLogin = () => {
    loginWithRedirect({
      connection: 'google-oauth2',
    });
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <h2>Loading EmpowerMEd secure login...</h2>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: '#f8f9fa'
    }}>
      <h2>Redirecting to EmpowerMEd secure login...</h2>
      <div style={{ marginTop: '20px' }}>
        <SocialButton provider="google" onClick={handleGoogleLogin} />
      </div>
    </div>
  );
}
