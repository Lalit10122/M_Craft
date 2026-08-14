import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newColName, setNewColName] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await api.get('/collections');
      setCollections(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newColName) return;
    
    try {
      if (editingId) {
        await api.put(`/admin/collections/${editingId}`, { name: newColName });
      } else {
        await api.post('/admin/collections', { name: newColName });
      }
      fetchCollections();
      setNewColName('');
      setEditingId(null);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save collection');
    }
  };

  const handleEdit = (col) => {
    setEditingId(col.id);
    setNewColName(col.name);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await api.delete(`/admin/collections/${id}`);
      setCollections(collections.filter(c => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 8px 0' }}>Collections</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Used in the site's navigation menu and product filters.</p>
        </div>
        <button onClick={() => { setEditingId(null); setNewColName(''); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Collection
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <div className="table-responsive-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
            <tr>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Slug</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Products</th>
              <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center' }}>Loading collections...</td></tr>
            ) : collections.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No collections found.</td></tr>
            ) : collections.map(col => (
              <tr key={col.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{col.name}</td>
                <td style={{ padding: '12px 16px', color: '#666', fontFamily: 'monospace' }}>{col.slug}</td>
                <td style={{ padding: '12px 16px' }}>{col._count?.products || 0}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(col)} style={{ padding: '6px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#555' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(col.id)} style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px' }}>{editingId ? 'Edit Collection' : 'Add Collection'}</h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Collection Name</label>
                <input 
                  type="text" 
                  value={newColName} 
                  onChange={e => setNewColName(e.target.value)} 
                  placeholder="e.g. Winter Sales" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
