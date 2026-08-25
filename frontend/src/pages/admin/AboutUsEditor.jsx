import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Save, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../components/common/ToastContext';

const AboutUsEditor = () => {
  const [settings, setSettings] = useState({
    hero_image: '',
    process_images: ['', '', '', ''],
    artisan_images: ['', '', '']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/public');
      if (res.data?.data?.about_us_content) {
        setSettings(res.data.data.about_us_content);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', {
        key: 'about_us_content',
        value: JSON.stringify(settings)
      });
      showToast('About Us settings saved', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to revert to default AI-generated images? This will overwrite your current images.')) return;
    try {
      setSaving(true);
      await api.post('/admin/settings/reset');
      await fetchSettings();
      showToast('Settings reverted to defaults', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to reset settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, type, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/admin/settings/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.data.url;
      
      if (type === 'hero_image') {
        setSettings({ ...settings, hero_image: url });
      } else if (type === 'process_images') {
        const newImages = [...settings.process_images];
        newImages[index] = url;
        setSettings({ ...settings, process_images: newImages });
      } else if (type === 'artisan_images') {
        const newImages = [...settings.artisan_images];
        newImages[index] = url;
        setSettings({ ...settings, artisan_images: newImages });
      }
      showToast('Image uploaded', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload image', 'error');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 500 }}>About Us Editor</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={handleReset} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Revert to Default
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        
        {/* Hero Section */}
        <section className="admin-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Hero Section Image</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '200px', height: '120px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px dashed #ccc' }}>
              {settings.hero_image ? (
                <img src={settings.hero_image} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}><ImageIcon /></div>
              )}
              <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s', color: 'white' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <Upload size={20} />
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_image')} />
              </label>
            </div>
            <div style={{ flex: 1, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              <p>Upload the main background image for the About Us page header. For best results, use a high-resolution wide image.</p>
            </div>
          </div>
        </section>

        {/* Process Sections */}
        <section className="admin-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Process Timeline Images</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[0, 1, 2, 3].map(idx => (
              <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: '4px', padding: '12px' }}>
                <p style={{ fontWeight: 500, marginBottom: '8px' }}>Process Phase {idx + 1}</p>
                <div style={{ width: '100%', aspectRatio: '4/5', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px dashed #ccc' }}>
                  {settings.process_images[idx] ? (
                    <img src={settings.process_images[idx]} alt={`Process ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}><ImageIcon /></div>
                  )}
                  <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s', color: 'white' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <Upload size={20} />
                    <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'process_images', idx)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Artisan Portraits */}
        <section className="admin-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Artisan Portraits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {['Elena R. (Master Jeweler)', 'Marcus T. (Stone Setter)', 'Sarah K. (Design Lead)'].map((name, idx) => (
              <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: '4px', padding: '12px' }}>
                <p style={{ fontWeight: 500, marginBottom: '8px', fontSize: '0.9rem' }}>{name}</p>
                <div style={{ width: '100%', aspectRatio: '3/4', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px dashed #ccc' }}>
                  {settings.artisan_images[idx] ? (
                    <img src={settings.artisan_images[idx]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}><ImageIcon /></div>
                  )}
                  <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s', color: 'white' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <Upload size={20} />
                    <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'artisan_images', idx)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutUsEditor;
