
//import appleIcon from '../assets/apple-icon.svg';   // replace with your actual icon path
import React from 'react';
import '../styles/signup.css';

// Optional: use public icons or remove entirely if you don't have SVGs
const ICONS = {
  google: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  apple: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'
};

export default function SocialButton({ provider, onClick }) {
  const icon = ICONS[provider.toLowerCase()] || null;
  const label = provider.toLowerCase() === 'google' ? 'Sign in with Google'
              : provider.toLowerCase() === 'apple' ? 'Sign in with Apple'
              : 'Sign in';

  return (
    <button className={`social-btn ${provider.toLowerCase()}`} onClick={onClick}>
      {icon && <img src={icon} alt={`${provider} icon`} className="social-icon" style={{ width: '20px', marginRight: '8px' }} />}
      <span>{label}</span>
    </button>
  );
}

