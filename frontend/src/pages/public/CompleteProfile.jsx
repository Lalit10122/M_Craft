import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import { Phone, CheckCircle } from 'lucide-react';

const CompleteProfile = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, updateUser } = useAuthStore();

  const from = location.state?.from || '/';

  // If they somehow got here without being logged in via Google first, send them to login
  if (!token || !user) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.put('/auth/complete-profile', { phone });
      updateUser(res.data.data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ background: '#e0f2fe', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0284c7' }}>
          <CheckCircle size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Almost There!</h1>
        <p style={{ color: '#666', lineHeight: 1.5 }}>
          You've successfully signed in with Google. We just need your phone number to complete your profile.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary" 
          style={{ padding: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile;
