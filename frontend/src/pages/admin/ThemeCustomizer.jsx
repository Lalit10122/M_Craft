import React, { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../components/common/ToastContext';

const DEFAULT_THEME_STATE = {
  presetName: '',
  primaryColor: '#000000',
  secondaryColor: '#6b7a62',
  accentColor: '#d9a036',
  backgroundColor: '#fdfbf7',
  textColor: '#2c2c2c',
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
  buttonStyle: 'rounded',
  logoUrl: ''
};

const ThemeCustomizer = () => {
  const [theme, setTheme] = useState(DEFAULT_THEME_STATE);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/theme');
      if (res.data.data) {
        setTheme({ ...DEFAULT_THEME_STATE, ...res.data.data.currentTheme });
        setPresets(res.data.data.presets || []);
      }
    } catch (err) {
      showToast('Failed to load theme settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setTheme({
      ...theme,
      ...preset
    });
    showToast(`Applied preset: ${preset.name}`, 'success');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTheme(prev => ({ ...prev, [name]: value, presetName: '' })); // clear preset name if custom edit
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/theme', theme);
      showToast('Theme saved successfully! Refreshing app to apply...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      showToast('Failed to save theme.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset to the default theme? This will clear all customizations.")) return;
    
    try {
      setSaving(true);
      await api.post('/admin/theme/reset');
      showToast('Theme reset successfully! Refreshing app to apply...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      showToast('Failed to reset theme.', 'error');
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setUploadingLogo(true);
      const res = await api.post('/admin/theme/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTheme(prev => ({ ...prev, logoUrl: res.data.data.logoUrl }));
      showToast('Logo uploaded successfully. Remember to save changes.', 'success');
    } catch (err) {
      showToast('Failed to upload logo.', 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div>Loading theme settings...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      
      {/* Editor Panel */}
      <div className="surface-card" style={{ flex: 1, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Appearance Settings</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={handleReset} disabled={saving}>
              <RefreshCw size={16} /> Reset Default
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </div>

        {/* Presets */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Quick Presets</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {presets.map(preset => (
              <div 
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                style={{ 
                  padding: '12px', 
                  border: `2px solid ${theme.presetName === preset.name ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  background: preset.backgroundColor
                }}
              >
                <div style={{ fontWeight: '500', color: preset.textColor, marginBottom: '8px', fontSize: '0.9rem' }}>{preset.name}</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: preset.primaryColor }} />
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: preset.secondaryColor }} />
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: preset.accentColor }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Logo */}
        <section style={{ marginBottom: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Brand Logo</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px', border: '1px dashed var(--color-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
              {theme.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <ImageIcon size={32} color="var(--color-text-muted)" />
              )}
            </div>
            <div>
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleLogoUpload} 
              />
              <button 
                className="btn btn-outline" 
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingLogo}
              >
                <Upload size={16} /> {uploadingLogo ? 'Uploading...' : 'Upload New Logo'}
              </button>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>Recommended: Transparent PNG, max 2MB.</p>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section style={{ marginBottom: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Colors</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'].map(colorKey => (
              <div key={colorKey}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', textTransform: 'capitalize' }}>
                  {colorKey.replace('Color', '')}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="color" 
                    name={colorKey} 
                    value={theme[colorKey]} 
                    onChange={handleChange}
                    style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    name={colorKey} 
                    value={theme[colorKey]} 
                    onChange={handleChange}
                    className="input-field"
                    style={{ flex: 1, padding: '8px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography & Buttons */}
        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Typography & Styling</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Heading Font</label>
              <select name="headingFont" value={theme.headingFont} onChange={handleChange} className="input-field" style={{ padding: '8px' }}>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Lora">Lora</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Inter">Inter</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Body Font</label>
              <select name="bodyFont" value={theme.bodyFont} onChange={handleChange} className="input-field" style={{ padding: '8px' }}>
                <option value="Inter">Inter</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Button Style</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['rounded', 'sharp', 'pill'].map(style => (
                  <label key={style} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="buttonStyle" value={style} checked={theme.buttonStyle === style} onChange={handleChange} />
                    <span style={{ textTransform: 'capitalize' }}>{style}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Live Preview Panel */}
      <div style={{ flex: '0 0 400px', position: 'sticky', top: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Live Preview</h3>
        <div 
          style={{ 
            border: '1px solid var(--color-border)', 
            borderRadius: '8px', 
            overflow: 'hidden',
            background: theme.backgroundColor,
            color: theme.textColor,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header Mock */}
          <div style={{ padding: '16px', borderBottom: `1px solid ${theme.textColor}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt="Logo" style={{ height: '24px' }} />
            ) : (
              <div style={{ fontFamily: `"${theme.headingFont}", serif`, fontSize: '1.2rem', fontWeight: 'bold' }}>Aurelia</div>
            )}
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontFamily: `"${theme.bodyFont}", sans-serif` }}>
              <span>Home</span>
              <span>Shop</span>
            </div>
          </div>

          {/* Hero Mock */}
          <div style={{ padding: '40px 24px', textAlign: 'center', background: `${theme.primaryColor}11` }}>
            <h1 style={{ fontFamily: `"${theme.headingFont}", serif`, fontSize: '2rem', marginBottom: '16px', color: theme.textColor }}>
              New Collection
            </h1>
            <p style={{ fontFamily: `"${theme.bodyFont}", sans-serif`, fontSize: '0.9rem', opacity: 0.8, marginBottom: '24px' }}>
              Discover our latest handcrafted jewelry pieces designed just for you.
            </p>
            <button 
              style={{ 
                background: theme.primaryColor, 
                color: theme.backgroundColor, 
                border: 'none', 
                padding: '12px 24px', 
                fontFamily: `"${theme.bodyFont}", sans-serif`,
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                letterSpacing: '1px',
                borderRadius: theme.buttonStyle === 'pill' ? '50px' : theme.buttonStyle === 'sharp' ? '0' : '4px',
                cursor: 'pointer'
              }}
            >
              Shop Now
            </button>
          </div>

          {/* Product Mock */}
          <div style={{ padding: '24px' }}>
            <div style={{ fontFamily: `"${theme.headingFont}", serif`, fontSize: '1.2rem', marginBottom: '16px' }}>Featured</div>
            <div style={{ background: theme.textColor + '0A', height: '150px', borderRadius: '4px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={32} color={`${theme.textColor}44`} />
            </div>
            <div style={{ fontFamily: `"${theme.bodyFont}", sans-serif`, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Diamond Ring</span>
              <span style={{ color: theme.accentColor, fontWeight: 'bold' }}>$999</span>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default ThemeCustomizer;
