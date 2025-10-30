import React, { useState } from 'react';
import SocialButton from '../components/SocialButton';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Correct env names
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get CSRF token first
      const csrfResponse = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: 'include',
      });
      if (!csrfResponse.ok) throw new Error('Failed to get CSRF token');
      const { csrfToken } = await csrfResponse.json();

      // Post signup data securely
      const signupRes = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await signupRes.json();

      if (signupRes.ok) {
        // redirect after success
        window.location.href = FRONTEND_URL;
      } else {
        setError(json.error || json.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Correct provider path
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Your Account</h1>
        {error && <div className="error-message">{error}</div>}

        <div className="social-login">
          <SocialButton provider="google" onClick={() => handleSocialLogin('google')} />
          <SocialButton provider="apple" onClick={() => handleSocialLogin('apple')} />
        </div>

        <div className="divider">or</div>

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}
