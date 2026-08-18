import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  
  const [status, setStatus] = useState('idle'); // idle, loading, error
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      // Always proceed to next step to prevent enumeration
      setStep(2);
      setStatus('idle');
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to send reset code.');
      }
      setStatus('error');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep(3);
    } else {
      setError('Please enter a valid 6-digit code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setStatus('loading');
    setError('');

    try {
      await api.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword: passwordData.password 
      });
      setStep(4);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Code might be expired or invalid.');
      setStatus('error');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', margin: '60px auto', padding: '0 20px' }}>
      
      {step < 4 && (
        <div style={{ marginBottom: '32px' }}>
          {step === 1 ? (
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', marginBottom: '24px', fontWeight: 500 }}>
              <ArrowLeft size={18} /> Back to Login
            </Link>
          ) : (
            <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '24px', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Create New Password'}
          </h1>
          <p style={{ color: '#666', lineHeight: 1.5 }}>
            {step === 1 && "Enter your email address and we'll send you a 6-digit code to reset your password."}
            {step === 2 && `We've sent a 6-digit code to ${email}. Please enter it below.`}
            {step === 3 && "Your new password must be at least 8 characters long and include at least one letter and one number."}
          </p>
        </div>
      )}

      {error && step < 4 && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
              <input 
                type="email" 
                required 
                placeholder="Enter your email"
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading' || !email}
            className="btn btn-primary" 
            style={{ padding: '14px', fontSize: '1rem', width: '100%', marginTop: '8px' }}
          >
            {status === 'loading' ? 'Sending Code...' : 'Send Reset Code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#888' }} />
              <input 
                type="text" 
                required 
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="^[0-9]{6}$"
                style={{ 
                  width: '100%', 
                  padding: '16px 16px 16px 40px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  fontSize: '1.2rem',
                  letterSpacing: '4px'
                }} 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={otp.length !== 6}
            className="btn btn-primary" 
            style={{ padding: '16px', fontSize: '1rem', width: '100%' }}
          >
            Verify Code
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                value={passwordData.password}
                onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
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
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading' || !passwordData.password || !passwordData.confirmPassword}
            className="btn btn-primary" 
            style={{ padding: '14px', fontSize: '1rem', width: '100%', marginTop: '8px' }}
          >
            {status === 'loading' ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 4 && (
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
      )}
    </div>
  );
};

export default ForgotPassword;
