import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: '450px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Invalid Reset Link</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>This password reset link is invalid or has expired.</p>
        <Link to="/forgot-password" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 500 }}>
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setStatus('loading');
    setError('');

    try {
      await api.post('/auth/reset-password', { token, newPassword: formData.password });
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
      setStatus('error');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', margin: '60px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Create New Password</h1>
        <p style={{ color: '#666', lineHeight: 1.5 }}>
          Your new password must be at least 8 characters long and include at least one letter and one number.
        </p>
      </div>

      {status === 'success' ? (
        <div style={{ background: '#fdfbf7', border: '1px solid #eee', padding: '32px 24px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={32} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Password Reset Successful</h2>
          <p style={{ color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
            Your password has been successfully updated. You will be redirected to the login page shortly.
          </p>
          <Link to="/login" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 500 }}>
            Go to Login
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
                <input 
                  type="password" 
                  required 
                  minLength="8"
                  pattern="^(?=.*[a-zA-Z])(?=.*\d).{8,}$"
                  title="Password must be at least 8 characters long and include at least one letter and one number."
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
                <input 
                  type="password" 
                  required 
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading' || !formData.password || !formData.confirmPassword}
              className="btn btn-primary" 
              style={{ padding: '14px', fontSize: '1rem', width: '100%', marginTop: '8px' }}
            >
              {status === 'loading' ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
