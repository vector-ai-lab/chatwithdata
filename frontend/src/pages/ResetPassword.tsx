import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FiMail, FiAlertCircle, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './auth.css';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authAPI.resetPassword(email);
      setMessage('Password reset instructions have been sent to your email.');
      setIsSuccess(true);
      toast.success('Reset instructions sent!');
    } catch (error) {
      setMessage('Failed to send reset instructions. Please try again.');
      setIsSuccess(false);
      toast.error('Failed to send reset instructions');
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <div className="auth-logo">
          <FiMessageSquare className="auth-logo-icon" />
        </div>
        <h1 className="auth-title">ChatWithData</h1>
        <p className="auth-subtitle">Reset your password</p>
        <div className="auth-card">
          {message && (
            <div className={isSuccess ? 'auth-success' : 'auth-error'}>
              {isSuccess ? (
                <FiCheckCircle className="auth-success-icon" />
              ) : (
                <FiAlertCircle className="auth-error-icon" />
              )}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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

            <button type="submit" className="auth-btn auth-btn-main">
              Send Reset Instructions
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login" className="auth-link">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 