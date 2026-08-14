import React, { useState, useEffect } from 'react';
import { ArrowLeft, UploadCloud, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const PromotionForm = ({ promotionId, onClose, onSuccess }) => {
  const isEditMode = !!promotionId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [image, setImage] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      api.get(`/admin/promotions/${promotionId}`)
        .then(res => {
          const p = res.data.data;
          setFormData({
            title: p.title,
            description: p.description || '',
            discountPercentage: p.discountPercentage || '',
            startDate: p.startDate ? p.startDate.split('T')[0] : '',
            endDate: p.endDate ? p.endDate.split('T')[0] : '',
            isActive: p.isActive
          });
          if (p.imageUrl) setImage(p.imageUrl);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load promotion');
          onClose();
        });
    }
  }, [promotionId, isEditMode, onClose]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleDeleteImage = () => {
    setImage(null);
    setPendingFile(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('discountPercentage', formData.discountPercentage);
      payload.append('startDate', formData.startDate);
      payload.append('endDate', formData.endDate);
      payload.append('isActive', formData.isActive);
      
      if (pendingFile) {
        payload.append('image', pendingFile);
      } else if (!image) {
        payload.append('removeImage', 'true');
      }

      if (isEditMode) {
        await api.put(`/admin/promotions/${promotionId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Promotion updated successfully!');
      } else {
        await api.post('/admin/promotions', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Promotion created successfully!');
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save promotion');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{isEditMode ? 'Edit Promotion' : 'Add New Promotion'}</h1>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>Basic Info</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.label}>Promotion Title *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={styles.input} required />
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.label}>Description</label>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={styles.input} />
            </div>

            <div>
              <label style={styles.label}>Discount Percentage</label>
              <input type="number" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} style={styles.input} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'end', paddingBottom: '10px' }}>
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
              <label style={{ ...styles.label, marginBottom: 0 }}>Active</label>
            </div>
          </div>
        </section>

        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>Duration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} style={styles.input} />
            </div>
          </div>
        </section>

        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>Banner Image</h3>
          
          <div style={{ 
            aspectRatio: '16/9', 
            background: '#f1f1f1', 
            borderRadius: '8px', 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: image ? 'none' : '2px dashed #ccc',
            overflow: 'hidden',
            maxWidth: '400px',
            marginBottom: '16px'
          }}>
            {image ? (
              <>
                <img src={image} alt="Promotion Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={handleDeleteImage}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', color: '#dc2626', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  title="Delete Image"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', color: '#888' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>No Banner Uploaded</span>
              </div>
            )}
          </div>
          
          <label style={{ ...styles.button, background: 'white', color: '#333', border: '1px solid #ccc', padding: '8px 16px', display: 'inline-block', cursor: 'pointer' }}>
            Select Image
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', position: 'sticky', bottom: '24px', background: 'rgba(255,255,255,0.9)', padding: '16px', borderRadius: '8px', border: '1px solid #eaeaea', backdropFilter: 'blur(8px)' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Save Promotion</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '0.95rem',
    background: '#fff'
  },
  button: {
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
  }
};

export default PromotionForm;
