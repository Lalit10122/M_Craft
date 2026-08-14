import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import api from '../../utils/api';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data.data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const resetForm = () => {
    setFormData({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
    setEditingId(null);
    setShowForm(false);
    setMessage({ text: '', type: '' });
  };

  const handleEdit = (address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setEditingId(address.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(addresses.filter(a => a.id !== id));
      // Refetch just in case default changed
      fetchAddresses();
    } catch (err) {
      setMessage({ text: 'Failed to delete address.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, formData);
        setMessage({ text: 'Address updated successfully!', type: 'success' });
      } else {
        await api.post('/addresses', formData);
        setMessage({ text: 'Address added successfully!', type: 'success' });
      }
      fetchAddresses();
      setTimeout(resetForm, 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save address.', type: 'error' });
    }
  };

  const setAsDefault = async (address) => {
    try {
      await api.put(`/addresses/${address.id}`, { ...address, isDefault: true });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading addresses...</div>;

  return (
    <div style={{ background: 'white', padding: 'var(--spacing-xl)', borderRadius: '12px', border: '1px solid #eaeaea' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Saved Addresses</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Manage your delivery addresses.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add New
          </button>
        )}
      </div>

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

      {showForm ? (
        <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Full Name</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="input-field" />
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Phone Number</label>
              <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="input-field" />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Flat, House no., Building</label>
              <input type="text" name="line1" required value={formData.line1} onChange={handleInputChange} className="input-field" />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Area, Street, Sector, Village</label>
              <input type="text" name="line2" value={formData.line2} onChange={handleInputChange} className="input-field" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>City</label>
              <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="input-field" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>State</label>
              <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="input-field" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Pincode</label>
              <input type="text" name="pincode" required value={formData.pincode} onChange={handleInputChange} className="input-field" />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} style={{ width: '16px', height: '16px' }} />
              <label htmlFor="isDefault" style={{ fontWeight: 500 }}>Make this my default address</label>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Address</button>
              <button type="button" onClick={resetForm} className="btn btn-outline" style={{ padding: '10px 24px' }}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {addresses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
              <MapPin size={40} style={{ color: '#ccc', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px', color: '#555' }}>No addresses found</h3>
              <p style={{ color: '#888', margin: 0 }}>Add a delivery address to make checkout faster.</p>
            </div>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} style={{ border: addr.isDefault ? '2px solid var(--color-primary)' : '1px solid #eaeaea', borderRadius: '8px', padding: '20px', position: 'relative' }}>
                {addr.isDefault && (
                  <span style={{ position: 'absolute', top: '-10px', left: '16px', background: 'var(--color-primary)', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>DEFAULT</span>
                )}
                
                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>{addr.fullName}</h4>
                <p style={{ margin: '0 0 4px', color: '#555' }}>{addr.line1}</p>
                {addr.line2 && <p style={{ margin: '0 0 4px', color: '#555' }}>{addr.line2}</p>}
                <p style={{ margin: '0 0 12px', color: '#555' }}>{addr.city}, {addr.state} {addr.pincode}</p>
                <p style={{ margin: '0 0 16px', color: '#333', fontWeight: 500 }}>Phone: {addr.phone}</p>
                
                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #eaeaea', paddingTop: '16px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleEdit(addr)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', fontWeight: 500 }}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 500 }}>
                    <Trash2 size={16} /> Delete
                  </button>
                  
                  {!addr.isDefault && (
                    <button onClick={() => setAsDefault(addr)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontWeight: 500, marginLeft: 'auto' }}>
                      <Check size={16} /> Set Default
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Addresses;
