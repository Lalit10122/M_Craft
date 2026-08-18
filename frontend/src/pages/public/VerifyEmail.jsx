import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuthStore();

  const from = location.state?.from || '/';

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.emailVerified) {
      navigate(from);
    }
  }, [user, navigate, from]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await api.post('/auth/verify-email', { code });
      
      // Update local store
      login({ ...user, emailVerified: true }, useAuthStore.getState().token);
      
      setMessage('Email verified successfully!');
      setTimeout(() => navigate(from), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setError('');
    setMessage('');
    try {
      await api.post('/auth/send-verification-email');
      setMessage('A new verification code has been sent to your email.');
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again later.');
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '450px', margin: '60px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Mail size={32} color="#666" />
        </div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Verify Your Email</h1>
        <p style={{ color: '#666', lineHeight: 1.5 }}>
          We've sent a 6-digit verification code to<br />
          <strong>{user.email}</strong>
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {message && (
        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem' }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <input 
            type="text" 
            required 
            placeholder="Enter 6-digit code"
            maxLength={6}
            pattern="^[0-9]{6}$"
            style={{ 
              width: '100%', 
              padding: '16px', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              fontSize: '1.2rem',
              textAlign: 'center',
              letterSpacing: '4px'
            }} 
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || code.length !== 6}
          className="btn btn-primary" 
          style={{ padding: '16px', fontSize: '1rem', width: '100%' }}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <p style={{ color: '#666', marginBottom: '12px' }}>Didn't receive the code?</p>
        <button 
          onClick={handleResend}
          disabled={cooldown > 0}
          style={{
            background: 'none',
            border: 'none',
            color: cooldown > 0 ? '#aaa' : 'var(--color-primary)',
            fontWeight: 600,
            cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
