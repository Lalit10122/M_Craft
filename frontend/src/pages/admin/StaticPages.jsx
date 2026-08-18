import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const StaticPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: true
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await api.get('/admin/pages');
      setPages(res.data.data || []);
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
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      };

      if (editingId) {
        await api.put(`/admin/pages/${editingId}`, payload);
      } else {
        await api.post('/admin/pages', payload);
      }
      
      fetchPages();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save page');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await api.delete(`/admin/pages/${id}`);
      setPages(pages.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete page');
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await api.put(`/admin/pages/${id}`, { isPublished: !currentStatus });
      setPages(pages.map(p => p.id === id ? { ...p, isPublished: !currentStatus } : p));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleEdit = (p) => {
    setFormData({
      title: p.title,
      slug: p.slug,
      content: p.content,
      isPublished: p.isPublished
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', content: '', isPublished: true });
    setEditingId(null);
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Static Pages</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create Page
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>URL Slug</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Published</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center' }}>Loading pages...</td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No pages found.</td></tr>
              ) : (
                pages.map(page => (
                  <tr key={page.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{page.title}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#666' }}>/page/{page.slug}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={page.isPublished} 
                          onChange={() => handleTogglePublish(page.id, page.isPublished)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} 
                        />
                      </label>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(page)} style={{ padding: '6px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#555' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(page.id)} style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>
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
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px' }}>{editingId ? 'Edit Page' : 'Create Page'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Page Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={styles.input} required />
                </div>
                <div>
                  <label style={styles.label}>Slug (Optional)</label>
                  <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={styles.input} placeholder="Auto-generated if empty" />
                </div>
              </div>

              <div>
                <label style={styles.label}>Content (HTML)</label>
                <textarea 
                  rows={12} 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  style={{ ...styles.input, fontFamily: 'monospace' }} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label style={{ ...styles.label, marginBottom: 0 }}>Published</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Page</button>
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

export default StaticPages;
