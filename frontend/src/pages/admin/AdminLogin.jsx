import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@aureliajewels.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const { requires2FA, requires2FASetup, tempToken, token, accessToken } = res.data.data;
      const finalToken = token || accessToken;
      
      if (requires2FA) {
        navigate('/admin/2fa-verify', { state: { tempToken } });
      } else if (requires2FASetup) {
        navigate('/admin/2fa-setup', { state: { tempToken } });
      } else if (finalToken) {
        // Direct login success
        localStorage.setItem('adminToken', finalToken);
        navigate('/admin');
      } else {
        // Fallback
        navigate('/admin/2fa-setup', { state: { tempToken } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>Aurelia Admin</div>
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', color: '#111' }}>Sign in to continue</h2>
        
        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={styles.input} 
              required 
            />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={styles.input} 
              required 
            />
          </div>
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
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
    background: '#111', // Darker theme for admin auth
  },
  card: {
    background: '#fff',
    padding: '48px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  logo: {
    fontSize: '1.2rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: 'var(--color-primary)',
    marginBottom: '8px',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1rem',
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
    marginTop: '8px',
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

export default AdminLogin;
