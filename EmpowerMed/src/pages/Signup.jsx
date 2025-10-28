import React, { useState } from 'react';
import SocialButton from '../components/SocialButton';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        // Call backend endpoint for secure signup
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h1>Create Your Account</h1>
                <div className="social-login">
                    <SocialButton provider="google" />
                    <SocialButton provider="apple" />
                </div>
                <div className="divider">or</div>
                <form onSubmit={handleSubmit} className="signup-form">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required
                    />
                    <button type="submit">Sign Up</button>
                </form>
                <p className="login-link">
                    Already have an account? <a href="/login">Log in</a>
                </p>
            </div>
        </div>
    );
}
