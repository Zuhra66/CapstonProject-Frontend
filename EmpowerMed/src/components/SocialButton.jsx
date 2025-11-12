import React from 'react';
import googleIcon from '../assets/google-icon.svg'; 
export default function SocialButton({ provider, onClick }) {
  const getProviderClass = () => {
    if (provider === 'google') return 'social-btn google';
    return 'social-btn';
  };

  const getIcon = () => {
    if (provider === 'google') return <img src={googleIcon} alt="Google" style={{ width: 20, marginRight: 10 }} />;
    return null;
  };

  return (
    <button className={getProviderClass()} onClick={onClick}>
      {getIcon()}
      Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </button>
  );
}
