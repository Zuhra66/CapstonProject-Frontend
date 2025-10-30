import React from 'react';

export default function SocialButton({ provider, onClick }) {
  const handleSocialLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <button
      className={`social-btn ${provider}`}
      onClick={onClick || handleSocialLogin}
    >
      {provider === 'google' ? 'Sign up with Google' : 'Sign up with Apple'}
    </button>
  );
}
