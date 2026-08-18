import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Save, AlertTriangle, ShieldOff } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    freeGiftThreshold: 0,
    codCap: 0,
    returnWindowDays: 7,
    lowStockThreshold: 5,
    global_banner_config: JSON.stringify({ isActive: false, showOnDesktop: true, showOnMobile: true, text: 'Free shipping on orders over ₹999', link: '/shop' })
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [disable2FAForm, setDisable2FAForm] = useState({ password: '', code: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.data) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        api.put('/admin/settings', { key, value: typeof value === 'object' ? JSON.stringify(value) : String(value) })
      );
      await Promise.all(promises);
      
      setSaving(false);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
      setSaving(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/admin/2fa/disable', disable2FAForm);
      alert('2FA Disabled successfully!');
      setShow2FAModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Store Settings</h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Global Banner Settings */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Global Announcement Banner</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="checkbox" 
                id="bannerActive"
                checked={JSON.parse(settings.global_banner_config).isActive} 
                onChange={e => {
                  const current = JSON.parse(settings.global_banner_config);
                  setSettings({...settings, global_banner_config: JSON.stringify({...current, isActive: e.target.checked})})
                }} 
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="bannerActive" style={{ fontSize: '1rem', fontWeight: 600 }}>Enable Global Banner</label>
            </div>

            {JSON.parse(settings.global_banner_config).isActive && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Banner Text</label>
                  <input 
                    type="text" 
                    value={JSON.parse(settings.global_banner_config).text} 
                    onChange={e => {
                      const current = JSON.parse(settings.global_banner_config);
                      setSettings({...settings, global_banner_config: JSON.stringify({...current, text: e.target.value})})
                    }} 
                    style={styles.input} 
                    placeholder="e.g., Free shipping on orders over ₹999"
                  />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Banner Link (Optional)</label>
                  <input 
                    type="text" 
                    value={JSON.parse(settings.global_banner_config).link} 
                    onChange={e => {
                      const current = JSON.parse(settings.global_banner_config);
                      setSettings({...settings, global_banner_config: JSON.stringify({...current, link: e.target.value})})
                    }} 
                    style={styles.input} 
                    placeholder="e.g., /shop"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="showDesktop"
                    checked={JSON.parse(settings.global_banner_config).showOnDesktop} 
                    onChange={e => {
                      const current = JSON.parse(settings.global_banner_config);
                      setSettings({...settings, global_banner_config: JSON.stringify({...current, showOnDesktop: e.target.checked})})
                    }} 
                  />
                  <label htmlFor="showDesktop">Show on Desktop Top</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="showMobile"
                    checked={JSON.parse(settings.global_banner_config).showOnMobile} 
                    onChange={e => {
                      const current = JSON.parse(settings.global_banner_config);
                      setSettings({...settings, global_banner_config: JSON.stringify({...current, showOnMobile: e.target.checked})})
                    }} 
                  />
                  <label htmlFor="showMobile">Show on Mobile Slider (Drawer)</label>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Promotion Settings */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Promotions & Offers</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Free Gift Promotion Threshold (₹)</label>
              <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#666' }}>Cart values above this amount will automatically receive the free gift.</p>
              <input 
                type="number" 
                value={settings.freeGiftThreshold} 
                onChange={e => setSettings({...settings, freeGiftThreshold: e.target.value})} 
                style={styles.input} 
              />
            </div>
          </div>
        </section>

        {/* Order Settings */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Orders & Returns</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={styles.label}>Cash on Delivery (COD) Cap (₹)</label>
              <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#666' }}>Maximum cart value allowed for COD orders.</p>
              <input 
                type="number" 
                value={settings.codCap} 
                onChange={e => setSettings({...settings, codCap: e.target.value})} 
                style={styles.input} 
              />
            </div>
            
            <div>
              <label style={styles.label}>Return Window (Days)</label>
              <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#666' }}>Number of days after delivery a return can be requested.</p>
              <input 
                type="number" 
                value={settings.returnWindowDays} 
                onChange={e => setSettings({...settings, returnWindowDays: e.target.value})} 
                style={styles.input} 
              />
            </div>
          </div>
        </section>

        {/* Inventory Settings */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>Inventory</h3>
          
          <div>
            <label style={styles.label}>Low Stock Alert Threshold</label>
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#666' }}>Trigger low stock alerts when inventory falls to this number or below.</p>
            <input 
              type="number" 
              value={settings.lowStockThreshold} 
              onChange={e => setSettings({...settings, lowStockThreshold: e.target.value})} 
              style={{...styles.input, maxWidth: '200px'}} 
            />
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', position: 'sticky', bottom: '24px', background: 'rgba(255,255,255,0.9)', padding: '16px', borderRadius: '8px', border: '1px solid #eaeaea', backdropFilter: 'blur(8px)' }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Security Section (Distinct from normal form save) */}
      <section style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', marginTop: '24px', marginBottom: '64px' }}>
        <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px', color: '#991b1b' }}>Security Settings</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Two-Factor Authentication</p>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Protect your admin account with 2FA.</p>
          </div>
          <button 
            type="button"
            onClick={() => setShow2FAModal(true)}
            style={{ padding: '8px 16px', background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldOff size={16} /> Disable 2FA
          </button>
        </div>
      </section>

      {/* Disable 2FA Modal */}
      {show2FAModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626', marginBottom: '16px' }}>
              <AlertTriangle size={28} />
              <h3 style={{ margin: 0 }}>Disable Two-Factor Authentication</h3>
            </div>
            
            <p style={{ color: '#333', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Disabling 2FA reduces the security of your admin account. To proceed, please enter your password and your current 2FA code.
            </p>

            <form onSubmit={handleDisable2FA} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>Account Password</label>
                <input 
                  type="password" 
                  value={disable2FAForm.password}
                  onChange={e => setDisable2FAForm({...disable2FAForm, password: e.target.value})}
                  style={styles.input} 
                  required 
                />
              </div>
              <div>
                <label style={styles.label}>Current 2FA Code</label>
                <input 
                  type="text" 
                  value={disable2FAForm.code}
                  onChange={e => setDisable2FAForm({...disable2FAForm, code: e.target.value})}
                  style={{ ...styles.input, letterSpacing: '4px', fontFamily: 'monospace' }} 
                  required 
                  maxLength={6}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShow2FAModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                  Disable 2FA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    fontSize: '0.9rem',
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  }
};

export default Settings;
