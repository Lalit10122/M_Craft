import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    validUntil: '',
    usageLimit: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
      };

      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      
      fetchCoupons();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/coupons/${id}`, { isActive: !currentStatus });
      setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  const handleEdit = (c) => {
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      validUntil: c.validUntil ? c.validUntil.split('T')[0] : '',
      usageLimit: c.usageLimit || '',
      isActive: c.isActive
    });
    setEditingId(c.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', validUntil: '', usageLimit: '', isActive: true });
    setEditingId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Coupons</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <div className="table-responsive-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
            <tr>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Code</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Value</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Min Order</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Valid Till</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Usage</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Active</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center' }}>Loading coupons...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No coupons found.</td></tr>
            ) : (
              coupons.map(coupon => (
                <tr key={coupon.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace', fontSize: '1.1rem' }}>{coupon.code}</td>
                  <td style={{ padding: '12px 16px' }}>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                  <td style={{ padding: '12px 16px' }}>₹{coupon.minOrderValue}</td>
                  <td style={{ padding: '12px 16px' }}>{coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'Forever'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {coupon.usageLimit ? (
                      <>
                        <div style={{ width: '100px', background: '#eee', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${(coupon.usageCount / coupon.usageLimit) * 100}%`, background: 'var(--color-primary)', height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{coupon.usageCount} / {coupon.usageLimit}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>{coupon.usageCount} / ∞</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={coupon.isActive} 
                        onChange={() => handleToggleActive(coupon.id, coupon.isActive)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} 
                      />
                    </label>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(coupon)} style={{ padding: '6px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#555' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 16px' }}>{editingId ? 'Edit Coupon' : 'Create Coupon'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>Coupon Code</label>
                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} style={styles.input} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Discount Type</label>
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} style={styles.input}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Discount Value</label>
                  <input type="number" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} style={styles.input} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Min Order Value</label>
                  <input type="number" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Usage Limit</label>
                  <input type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} style={styles.input} placeholder="Leave empty for unlimited" />
                </div>
              </div>
              <div>
                <label style={styles.label}>Valid Until</label>
                <input type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} style={styles.input} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#333' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.95rem' }
};

export default Coupons;
