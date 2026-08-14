import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const AdminTwoFactorVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tempToken = location.state?.tempToken;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = useRef([]);

  // Redirect if accessed directly without temp token
  if (!tempToken) {
    navigate('/admin/login');
    return null;
  }

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto-advance
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      // Focus last filled input
      const focusIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const verifyCode = useBackup ? backupCode : code.join('');

    try {
      const payload = { tempToken };
      if (useBackup) {
        payload.backupCode = backupCode;
      } else {
        payload.code = code.join('');
      }

      const res = await api.post('/auth/2fa/verify', payload);
      
      localStorage.setItem('adminToken', res.data.data.token);
      navigate('/admin');
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.expired) {
        setError('Session expired, please log in again.');
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        setError('Invalid code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '8px', fontSize: '1.5rem', color: '#111' }}>Two-Factor Authentication</h2>
        <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.95rem' }}>
          {useBackup 
            ? 'Enter one of your 8-character backup codes.' 
            : 'Enter the 6-digit code from your authenticator app.'}
        </p>
        
        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {!useBackup ? (
            <div style={styles.codeContainer} onPaste={handlePaste}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputRefs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(idx, e)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={styles.digitInput}
                />
              ))}
            </div>
          ) : (
            <input 
              type="text" 
              placeholder="e.g. 8f7d9a2b"
              value={backupCode} 
              onChange={e => setBackupCode(e.target.value)} 
              style={{ ...styles.input, letterSpacing: '2px', textAlign: 'center', textTransform: 'uppercase' }} 
              required 
            />
          )}
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            type="button" 
            onClick={() => setUseBackup(!useBackup)} 
            style={styles.toggleBtn}
          >
            {useBackup ? 'Use Authenticator App instead' : 'Use a backup code instead'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111',
  },
  card: {
    background: '#fff',
    padding: '48px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  codeContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  digitInput: {
    width: '45px',
    height: '55px',
    fontSize: '1.5rem',
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1.2rem',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#0369a1',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '16px',
    border: '1px solid #f87171'
  }
};

export default AdminTwoFactorVerify;
