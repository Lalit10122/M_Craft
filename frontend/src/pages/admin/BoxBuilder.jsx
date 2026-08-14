import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const BoxBuilder = () => {
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    basePrice: '',
    isActive: true,
    steps: []
  });

  useEffect(() => {
    fetchBuilders();
  }, []);

  const fetchBuilders = async () => {
    try {
      const res = await api.get('/admin/box-builders');
      setBuilders(res.data.data || []);
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
        basePrice: parseFloat(formData.basePrice) || 0,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      };

      if (editingId) {
        await api.put(`/admin/box-builders/${editingId}`, payload);
      } else {
        await api.post('/admin/box-builders', payload);
      }
      
      fetchBuilders();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save box builder');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/box-builders/${id}`, { isActive: !currentStatus });
      setBuilders(builders.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Box Builder?')) return;
    try {
      await api.delete(`/admin/box-builders/${id}`);
      setBuilders(builders.filter(b => b.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleEdit = (b) => {
    setFormData({
      name: b.name,
      slug: b.slug,
      description: b.description || '',
      basePrice: b.basePrice || '',
      isActive: b.isActive,
      steps: b.steps || []
    });
    setEditingId(b.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', basePrice: '', isActive: true, steps: [] });
    setEditingId(null);
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { stepName: '', description: '', maxItems: 1 }]
    });
  };

  const updateStep = (index, field, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index][field] = value;
    setFormData({ ...formData, steps: updatedSteps });
  };

  const removeStep = (index) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Box Builders</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create Box Builder
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Base Price</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Steps</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Active</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
              ) : builders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No box builders found.</td></tr>
              ) : (
                builders.map(builder => (
                  <tr key={builder.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                      {builder.name}
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>/{builder.slug}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>₹{builder.basePrice || 0}</td>
                    <td style={{ padding: '12px 16px' }}>{builder.steps?.length || 0} Steps</td>
                    <td style={{ padding: '12px 16px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={builder.isActive} 
                          onChange={() => handleToggleActive(builder.id, builder.isActive)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} 
                        />
                      </label>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(builder)} style={{ padding: '6px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#555' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(builder.id)} style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>
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
            <h3 style={{ margin: '0 0 16px' }}>{editingId ? 'Edit Box Builder' : 'Create Box Builder'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input} required />
                </div>
                <div>
                  <label style={styles.label}>Slug (Optional)</label>
                  <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={styles.input} placeholder="Auto-generated if empty" />
                </div>
              </div>

              <div>
                <label style={styles.label}>Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={styles.input} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Base Price (₹)</label>
                  <input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} style={styles.input} required />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '28px' }}>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <label style={{ ...styles.label, marginBottom: 0 }}>Active</label>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0 }}>Steps Configurations</h4>
                  <button type="button" onClick={addStep} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    <Plus size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Add Step
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f9f9f9', padding: '16px', borderRadius: '8px', border: '1px solid #eee' }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ ...styles.label, fontSize: '0.75rem' }}>Step Name</label>
                        <input type="text" value={step.stepName} onChange={(e) => updateStep(idx, 'stepName', e.target.value)} style={styles.input} required />
                      </div>
                      <div style={{ flex: 3 }}>
                        <label style={{ ...styles.label, fontSize: '0.75rem' }}>Description</label>
                        <input type="text" value={step.description} onChange={(e) => updateStep(idx, 'description', e.target.value)} style={styles.input} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...styles.label, fontSize: '0.75rem' }}>Max Items</label>
                        <input type="number" min="1" value={step.maxItems} onChange={(e) => updateStep(idx, 'maxItems', parseInt(e.target.value) || 1)} style={styles.input} required />
                      </div>
                      <button type="button" onClick={() => removeStep(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', marginTop: '24px' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {formData.steps.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>No steps added. Customers won't be able to build a box.</p>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Box Builder</button>
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

export default BoxBuilder;
