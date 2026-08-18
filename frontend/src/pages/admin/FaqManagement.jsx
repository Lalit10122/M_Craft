import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const FaqManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    isActive: true
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await api.get('/admin/faqs');
      setFaqs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/faqs/${editingId}`, formData);
      } else {
        await api.post('/admin/faqs', formData);
      }
      
      fetchFaqs();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save FAQ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await api.delete(`/admin/faqs/${id}`);
      setFaqs(faqs.filter(f => f.id !== id));
    } catch (err) {
      alert('Failed to delete FAQ');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/faqs/${id}`, { isActive: !currentStatus });
      setFaqs(faqs.map(f => f.id === id ? { ...f, isActive: !currentStatus } : f));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleEdit = (f) => {
    setFormData({
      question: f.question,
      answer: f.answer,
      category: f.category || 'General',
      isActive: f.isActive
    });
    setEditingId(f.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '', category: 'General', isActive: true });
    setEditingId(null);
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>FAQ Management</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, width: '30%' }}>Question</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, width: '40%' }}>Answer</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Active</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center' }}>Loading FAQs...</td></tr>
              ) : faqs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No FAQs found.</td></tr>
              ) : (
                faqs.map(faq => (
                  <tr key={faq.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{faq.question}</td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {faq.answer}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {faq.category || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={faq.isActive} 
                          onChange={() => handleToggleActive(faq.id, faq.isActive)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} 
                        />
                      </label>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(faq)} style={{ padding: '6px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#555' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(faq.id)} style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '600px' }}>
            <h3 style={{ margin: '0 0 16px' }}>{editingId ? 'Edit FAQ' : 'Create FAQ'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={styles.label}>Question</label>
                <input type="text" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} style={styles.input} required />
              </div>

              <div>
                <label style={styles.label}>Answer</label>
                <textarea rows={5} value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} style={styles.input} required />
              </div>

              <div>
                <label style={styles.label}>Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={styles.input} placeholder="e.g. Shipping, Returns, Products" required />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label style={{ ...styles.label, marginBottom: 0 }}>Active</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save FAQ</button>
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

export default FaqManagement;
