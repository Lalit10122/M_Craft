import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const loginAction = useAuthStore(state => state.login);

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/login', formData);
      const { user, accessToken: token } = res.data.data;
      
      loginAction(user, token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post('/auth/google', {
          idToken: tokenResponse.access_token 
        });
        
        const { user, accessToken, requiresPhone } = res.data.data;
        loginAction(user, accessToken);
        
        if (requiresPhone) {
          navigate('/complete-profile', { state: { from } });
        } else {
          navigate(from, { replace: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Google Sign-In failed');
      }
    },
    onError: () => setError('Google login failed')
  });

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h1>
        <p style={{ color: '#666' }}>Sign in to continue to Aurelia Jewels</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
            <input 
              type="email" 
              required 
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
            <input 
              type="password" 
              required 
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
              Forgot Password?
            </Link>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary" 
          style={{ padding: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}
        >
          {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
        </button>
      </form>

      <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: '#888' }}>
        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
        <span style={{ padding: '0 16px', fontSize: '0.85rem' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
      </div>

      <button 
        onClick={() => googleLogin()} 
        type="button"
        style={{ width: '100%', padding: '12px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 500, color: '#333' }}
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
        Sign in with Google
      </button>

      <p style={{ textAlign: 'center', marginTop: '32px', color: '#666' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
