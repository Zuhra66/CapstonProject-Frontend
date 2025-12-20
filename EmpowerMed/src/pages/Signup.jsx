// src/pages/Signup.jsx
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import SocialButton from '../components/SocialButton';

export default function Signup() {
  const { loginWithRedirect, isLoading } = useAuth0();

  useEffect(() => {
    const timer = setTimeout(() => {
      loginWithRedirect({
        screen_hint: 'signup',
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [loginWithRedirect]);

  const handleGoogleSignup = () => {
    loginWithRedirect({
      connection: 'google-oauth2',
      screen_hint: 'signup',
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
        <h2>Loading EmpowerMEd secure signup...</h2>
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
      <h2>Redirecting to EmpowerMEd secure signup...</h2>
      <div style={{ marginTop: '20px' }}>
        <SocialButton provider="google" onClick={handleGoogleSignup} />
      </div>
    </div>
  );
}