import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        updateUser(res.data.data);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: 'var(--spacing-xl)', borderRadius: '12px', border: '1px solid #eaeaea' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Profile Details</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xl)' }}>
        Manage your personal information and account settings.
      </p>

      {message.text && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#dc2626',
          fontSize: '0.95rem'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
        
        {/* Read-only Email Field */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} />
            <input 
              type="email" 
              readOnly
              disabled
              value={user?.email || ''}
              style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', background: '#f8f9fa', color: '#666', cursor: 'not-allowed' }} 
            />
          </div>
          {user?.authProvider === 'GOOGLE' && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#0284c7', marginTop: '6px', fontWeight: 500 }}>
              <ShieldCheck size={14} /> Linked with Google
            </p>
          )}
        </div>

        {/* Editable Name Field */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} />
            <input 
              type="text" 
              name="name"
              required
              minLength="2"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
            />
          </div>
        </div>

        {/* Editable Phone Field */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Phone Number (10 digits)</label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }} />
            <input 
              type="text" 
              name="phone"
              pattern="^[6-9]\d{9}$"
              title="Please enter a valid 10-digit Indian phone number starting with 6-9"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || (formData.name === user?.name && formData.phone === (user?.phone || ''))}
          className="btn btn-primary" 
          style={{ padding: '12px', fontSize: '1rem', marginTop: '8px', width: 'fit-content' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
