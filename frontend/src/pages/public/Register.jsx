import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import { Mail, Lock, UserPlus, User, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const loginAction = useAuthStore(state => state.login);

  const from = location.state?.from?.pathname || '/';

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/register', formData);
      const { user, accessToken: token } = res.data.data;
      
      loginAction(user, token);
      if (user.authProvider === 'LOCAL' && !user.emailVerified) {
        navigate('/verify-email', { state: { from } });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.errors?.fieldErrors) {
        const firstErrorKey = Object.keys(err.response.data.errors.fieldErrors)[0];
        const firstErrorMsg = err.response.data.errors.fieldErrors[firstErrorKey][0];
        setError(`${firstErrorKey}: ${firstErrorMsg}`);
      } else {
        setError(err.response?.data?.message || 'Failed to register');
      }
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
    <div className="container" style={{ maxWidth: '450px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Create an Account</h1>
        <p style={{ color: '#666' }}>Join Aurelia Jewels today</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
            <input 
              type="text" 
              required 
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

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
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Phone Number (10 digits)</label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
            <input 
              type="text" 
              required 
              pattern="^[6-9]\d{9}$"
              title="Please enter a valid 10-digit Indian phone number starting with 6-9"
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Password (min 8 chars, 1 letter, 1 number)</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
            <input 
              type="password" 
              required 
              minLength="8"
              pattern="^(?=.*[a-zA-Z])(?=.*\d).{8,}$"
              title="Password must be at least 8 characters long and include at least one letter and one number."
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary" 
          style={{ padding: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}
        >
          {loading ? 'Creating Account...' : <><UserPlus size={18} /> Sign Up</>}
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
        Sign up with Google
      </button>

      <p style={{ textAlign: 'center', marginTop: '32px', color: '#666' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
      </p>
    </div>
  );
};

export default Register;
