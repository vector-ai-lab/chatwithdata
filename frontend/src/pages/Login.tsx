import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Demo credentials
  const DEMO_EMAIL = 'demo@example.com';
  const DEMO_PASSWORD = 'demo123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check for demo credentials
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      try {
        await login(email, password);
        toast.success('Welcome back!');
      } catch (error) {
        setError('Login failed. Please try again.');
        toast.error('Login failed');
      }
      return;
    }

    // Regular login flow
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error) {
      setError('Invalid email or password');
      toast.error('Login failed');
    }
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-logo">
          <FiMessageSquare className="login-logo-icon" />
        </div>
        <h1 className="login-title">ChatWithData</h1>
        <p className="login-subtitle">Sign in to continue</p>
        <div className="login-card">
          {error && (
            <div className="login-error">
              <FiAlertCircle className="login-error-icon" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email" className="login-label">Email</label>
              <div className="login-input-wrapper">
                <FiMail className="login-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div className="login-field">
              <label htmlFor="password" className="login-label">Password</label>
              <div className="login-input-wrapper">
                <FiLock className="login-input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <button type="submit" className="login-btn login-btn-main">Sign In</button>
            <button type="button" onClick={handleDemoLogin} className="login-btn login-btn-demo">Use Demo Account</button>
          </form>
          <div className="login-links">
            <Link to="/signup" className="login-link">Don't have an account? Sign up</Link>
            <Link to="/reset-password" className="login-link">Forgot your password?</Link>
          </div>
          <div className="login-demo-box">
            <p>
              <span className="login-demo-label">Demo Credentials:</span><br />
              Email: <span className="login-demo-value">demo@example.com</span><br />
              Password: <span className="login-demo-value">demo123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 