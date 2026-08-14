import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import PromotionForm from './PromotionForm';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await api.get('/admin/promotions');
      setPromotions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      await api.delete(`/admin/promotions/${id}`);
      setPromotions(promotions.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete promotion');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/promotions/${id}`, { isActive: !currentStatus });
      setPromotions(promotions.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (showForm) {
    return (
      <PromotionForm 
        promotionId={editingId} 
        onClose={() => { setShowForm(false); setEditingId(null); }} 
        onSuccess={() => { setShowForm(false); setEditingId(null); fetchPromotions(); }} 
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Promotions</h1>
        <button onClick={() => { setEditingId(null); setShowForm(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Promotion
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Discount</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Start Date</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>End Date</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Active</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center' }}>Loading promotions...</td></tr>
              ) : promotions.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No promotions found.</td></tr>
              ) : (
                promotions.map(promo => (
                  <tr key={promo.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {promo.imageUrl && (
                          <img src={promo.imageUrl} alt={promo.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        {promo.title}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{promo.discountPercentage ? `${promo.discountPercentage}%` : '-'}</td>
                    <td style={{ padding: '12px 16px' }}>{promo.startDate ? new Date(promo.startDate).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '12px 16px' }}>{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={promo.isActive} 
                          onChange={() => handleToggleActive(promo.id, promo.isActive)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} 
                        />
                      </label>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setEditingId(promo.id); setShowForm(true); }} style={{ padding: '6px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#555' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(promo.id)} style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>
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
    </div>
  );
};

export default Promotions;
