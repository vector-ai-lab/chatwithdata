import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiMessageSquare, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaWindows } from 'react-icons/fa';

import toast from 'react-hot-toast';
import './auth.css';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signup(name, email, password);
      toast.success('Account created successfully!');
    } catch (error) {
      setError('Failed to create account. Please try again.');
      toast.error('Signup failed');
    }
  };

  const handleOAuthSignup = (provider: 'google' | 'github' | 'microsoft') => {
    let url = '';
    if (provider === 'google') url = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    if (provider === 'github') url = `${import.meta.env.VITE_API_BASE_URL}/auth/github`;
    if (provider === 'microsoft') url = `${import.meta.env.VITE_API_BASE_URL}/auth/microsoft`;
    window.location.href = url;
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <div className="auth-logo">
          <FiMessageSquare className="auth-logo-icon" />
        </div>
        <h1 className="auth-title">ChatWithData</h1>
        <p className="auth-subtitle">Create your account</p>
        <div className="auth-card">
          {error && (
            <div className="auth-error">
              <FiAlertCircle className="auth-error-icon" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name" className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <FiUser className="auth-input-icon" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <FiMail className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn auth-btn-main">
              Create Account
            </button>
          </form>

          <div className="auth-oauth-divider">or sign up with</div>
          <div className="auth-oauth-buttons">
            <button className="auth-oauth-btn google" onClick={() => handleOAuthSignup('google')}>
              <FcGoogle size={20} /> Google
            </button>
            <button className="auth-oauth-btn github" onClick={() => handleOAuthSignup('github')}>
              <FiGithub size={20} /> GitHub
            </button>
            <button className="auth-oauth-btn microsoft" onClick={() => handleOAuthSignup('microsoft')}>
              <FaWindows size={20} /> Microsoft
            </button>
          </div>

          <div className="auth-links">
            <Link to="/login" className="auth-link">Already have an account? Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 