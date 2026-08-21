import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Save, RefreshCw, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../components/common/ToastContext';

const HomepageEditor = () => {
  const [settings, setSettings] = useState({
    homepage_hero_slides: [],
    homepage_brand_story: {
      background_text: '',
      heading_normal: '',
      heading_italic: '',
      description: '',
      button_text: '',
      button_link: '',
      image: '',
      badge_top: '',
      badge_bottom: ''
    },
    homepage_newsletter: {
      image: '',
      heading_normal: '',
      heading_italic: '',
      description: ''
    }
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
      const res = await api.get('/admin/settings');
      if (res.data.data) {
        setSettings({
          homepage_hero_slides: res.data.data.homepage_hero_slides || [],
          homepage_brand_story: res.data.data.homepage_brand_story || {},
          homepage_newsletter: res.data.data.homepage_newsletter || {}
        });
      }
    } catch (err) {
      showToast('Failed to load settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', { settings });
      showToast('Homepage settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset the homepage to the original Impeccable design?")) return;
    
    try {
      setSaving(true);
      await api.post('/admin/settings/reset');
      showToast('Homepage reset successfully!', 'success');
      fetchSettings();
    } catch (err) {
      showToast('Failed to reset.', 'error');
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, key, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/admin/settings/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.data.url;
      
      if (key === 'homepage_hero_slides' && index !== null) {
        const newSlides = [...settings.homepage_hero_slides];
        newSlides[index].image = url;
        setSettings({ ...settings, homepage_hero_slides: newSlides });
      } else {
        setSettings({
          ...settings,
          [key]: { ...settings[key], image: url }
        });
      }
      showToast('Image uploaded', 'success');
    } catch (err) {
      showToast('Image upload failed', 'error');
    }
  };

  const handleSlideChange = (index, field, value) => {
    const newSlides = [...settings.homepage_hero_slides];
    newSlides[index][field] = value;
    setSettings({ ...settings, homepage_hero_slides: newSlides });
  };

  const handleBrandStoryChange = (field, value) => {
    setSettings({
      ...settings,
      homepage_brand_story: { ...settings.homepage_brand_story, [field]: value }
    });
  };

  const handleNewsletterChange = (field, value) => {
    setSettings({
      ...settings,
      homepage_newsletter: { ...settings.homepage_newsletter, [field]: value }
    });
  };

  if (loading) return <div>Loading editor...</div>;

  return (
    <div style={{ maxWidth: '1000px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 8px 0' }}>Homepage Editor</h1>
          <p style={{ color: '#666', margin: 0 }}>Update the text, images, and messaging across the public homepage.</p>
        </div>
        <button onClick={handleReset} type="button" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Reset to Default
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* HERO SLIDES */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Hero Carousel</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {settings.homepage_hero_slides.map((slide, idx) => (
              <div key={idx} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', position: 'relative' }}>
                <h4 style={{ margin: '0 0 16px 0' }}>Slide {idx + 1}</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
                  {/* Image Upload */}
                  <div>
                    <div style={{ width: '100%', height: '120px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden', position: 'relative', marginBottom: '8px' }}>
                      {slide.image ? (
                        <img src={slide.image} alt="Slide" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={32} color="#aaa" /></div>
                      )}
                    </div>
                    <label style={{ display: 'block', textAlign: 'center', background: 'white', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <Upload size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Change Image
                      <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'homepage_hero_slides', idx)} />
                    </label>
                  </div>
                  
                  {/* Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Heading</label>
                      <input type="text" value={slide.title} onChange={e => handleSlideChange(idx, 'title', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Subtitle</label>
                      <input type="text" value={slide.subtitle} onChange={e => handleSlideChange(idx, 'subtitle', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Button Text</label>
                        <input type="text" value={slide.cta} onChange={e => handleSlideChange(idx, 'cta', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Button Link</label>
                        <input type="text" value={slide.link} onChange={e => handleSlideChange(idx, 'link', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BRAND STORY */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Brand Story Section</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }}>
            {/* Image */}
            <div>
              <div style={{ width: '100%', height: '300px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden', position: 'relative', marginBottom: '8px' }}>
                {settings.homepage_brand_story.image ? (
                  <img src={settings.homepage_brand_story.image} alt="Brand" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={48} color="#aaa" /></div>
                )}
              </div>
              <label style={{ display: 'block', textAlign: 'center', background: 'white', border: '1px solid #ccc', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <Upload size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Change Photo
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'homepage_brand_story')} />
              </label>
            </div>

            {/* Text Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Background Watermark Text</label>
                <input type="text" value={settings.homepage_brand_story.background_text} onChange={e => handleBrandStoryChange('background_text', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Heading (Normal text)</label>
                  <input type="text" value={settings.homepage_brand_story.heading_normal} onChange={e => handleBrandStoryChange('heading_normal', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Heading (Italic text)</label>
                  <input type="text" value={settings.homepage_brand_story.heading_italic} onChange={e => handleBrandStoryChange('heading_italic', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Description Paragraph</label>
                <textarea rows={4} value={settings.homepage_brand_story.description} onChange={e => handleBrandStoryChange('description', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Image Badge (Top)</label>
                  <input type="text" value={settings.homepage_brand_story.badge_top} onChange={e => handleBrandStoryChange('badge_top', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Image Badge (Bottom)</label>
                  <input type="text" value={settings.homepage_brand_story.badge_bottom} onChange={e => handleBrandStoryChange('badge_bottom', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Button Text</label>
                  <input type="text" value={settings.homepage_brand_story.button_text} onChange={e => handleBrandStoryChange('button_text', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Button Link</label>
                  <input type="text" value={settings.homepage_brand_story.button_link} onChange={e => handleBrandStoryChange('button_link', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Newsletter Banner</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }}>
            <div>
              <div style={{ width: '100%', height: '200px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden', position: 'relative', marginBottom: '8px' }}>
                {settings.homepage_newsletter.image ? (
                  <img src={settings.homepage_newsletter.image} alt="Newsletter" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={48} color="#aaa" /></div>
                )}
              </div>
              <label style={{ display: 'block', textAlign: 'center', background: 'white', border: '1px solid #ccc', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <Upload size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Change Photo
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'homepage_newsletter')} />
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Heading (Normal text)</label>
                  <input type="text" value={settings.homepage_newsletter.heading_normal} onChange={e => handleNewsletterChange('heading_normal', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Heading (Italic text)</label>
                  <input type="text" value={settings.homepage_newsletter.heading_italic} onChange={e => handleNewsletterChange('heading_italic', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Description Paragraph</label>
                <textarea rows={3} value={settings.homepage_newsletter.description} onChange={e => handleNewsletterChange('description', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: '24px', zIndex: 10 }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Save size={20} /> {saving ? 'Saving...' : 'Save Homepage Settings'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default HomepageEditor;
