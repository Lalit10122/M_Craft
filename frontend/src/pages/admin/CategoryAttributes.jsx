import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const CategoryAttributes = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'TEXT',
    options: '',
    isRequired: false
  });

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        setCategories(res.data.data || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchAttributes();
    } else {
      setAttributes([]);
    }
  }, [selectedCategoryId]);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/category-attributes?categoryId=${selectedCategoryId}`);
      setAttributes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) return alert('Please select a category first.');

    try {
      const payload = {
        categoryId: selectedCategoryId,
        name: formData.name,
        type: formData.type,
        options: formData.type === 'SELECT' || formData.type === 'MULTISELECT' ? formData.options.split(',').map(s => s.trim()).filter(Boolean) : [],
        isRequired: formData.isRequired
      };

      await api.post('/admin/category-attributes', payload);
      fetchAttributes();
      setShowModal(false);
      setFormData({ name: '', type: 'TEXT', options: '', isRequired: false });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add attribute');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attribute?')) return;
    try {
      await api.delete(`/admin/category-attributes/${id}`);
      setAttributes(attributes.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete attribute');
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Category Attributes</h1>
        <button 
          onClick={() => {
            if (!selectedCategoryId) return alert('Select a category first.');
            setShowModal(true);
          }} 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={!selectedCategoryId}
        >
          <Plus size={18} /> Add Attribute
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Categories List */}
        <div style={{ flex: '1 1 250px', background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', alignSelf: 'flex-start' }}>
          <h3 style={{ margin: '0 0 16px' }}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{ 
                  padding: '10px 16px', 
                  textAlign: 'left', 
                  border: '1px solid',
                  borderColor: selectedCategoryId === cat.id ? 'var(--color-primary)' : '#eaeaea',
                  background: selectedCategoryId === cat.id ? '#f0fdf4' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: selectedCategoryId === cat.id ? 600 : 400
                }}
              >
                {cat.name}
              </button>
            ))}
            {categories.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>No categories found.</p>}
          </div>
        </div>

        {/* Attributes List */}
        <div style={{ flex: '2 1 500px', background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          {!selectedCategoryId ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              Please select a category to view and manage its attributes.
            </div>
          ) : (
            <>
              <h3 style={{ margin: '0 0 16px' }}>
                Attributes for {categories.find(c => c.id === selectedCategoryId)?.name}
              </h3>
              
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
              ) : attributes.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                  No attributes found for this category.
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Name</th>
                        <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Type</th>
                        <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Required</th>
                        <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attributes.map(attr => (
                        <tr key={attr.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                            {attr.name}
                            {(attr.type === 'SELECT' || attr.type === 'MULTISELECT') && attr.options?.length > 0 && (
                              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                Options: {attr.options.join(', ')}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>{attr.type}</td>
                          <td style={{ padding: '12px 16px' }}>{attr.isRequired ? 'Yes' : 'No'}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button onClick={() => handleDelete(attr.id)} style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px' }}>Add Attribute</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>Attribute Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              </div>
              
              <div>
                <label style={styles.label}>Input Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={styles.input}>
                  <option value="TEXT">Text</option>
                  <option value="NUMBER">Number</option>
                  <option value="SELECT">Dropdown (Select)</option>
                  <option value="MULTISELECT">Multi-select</option>
                  <option value="BOOLEAN">Yes/No (Boolean)</option>
                </select>
              </div>

              {(formData.type === 'SELECT' || formData.type === 'MULTISELECT') && (
                <div>
                  <label style={styles.label}>Options (comma separated)</label>
                  <input type="text" value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})} style={styles.input} placeholder="e.g. Red, Blue, Green" required />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.isRequired} onChange={e => setFormData({...formData, isRequired: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label style={{ ...styles.label, marginBottom: 0 }}>Is Required?</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Attribute</button>
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

export default CategoryAttributes;
