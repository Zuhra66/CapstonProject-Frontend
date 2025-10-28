import React from 'react';


export default function SocialButton({ provider }) {
    const handleSocialLogin = () => {
        // Redirect to backend for OAuth2 flow
        window.location.href = `/auth/${provider}`;
    };

    return (
        <button className={`social-btn ${provider}`} onClick={handleSocialLogin}>
            {provider === 'google' ? 'Sign up with Google' : 'Sign up with Apple'}
        </button>
    );
}
