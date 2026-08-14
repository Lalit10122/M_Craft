import React, { useState, useEffect } from 'react';
import { UploadCloud, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const Pincodes = () => {
  const [pincodes, setPincodes] = useState([]);
  const [newPin, setNewPin] = useState('');
  const [newDays, setNewDays] = useState('');
  const [newCod, setNewCod] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      // Trying to fetch from public route or admin route if available
      const res = await api.get('/admin/pincodes').catch(() => api.get('/pincodes'));
      if (res.data.data) {
        setPincodes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pincodes, using empty list.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newPin || !newDays) return;
    try {
      const payload = { pincode: newPin, estimatedDays: String(newDays), codAvailable: newCod };
      const res = await api.post('/admin/pincodes', payload);
      setPincodes([...pincodes, res.data.data]);
      setNewPin('');
      setNewDays('');
      setNewCod(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add pincode');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/pincodes/${id}`);
      setPincodes(pincodes.filter(p => p.id !== id && p.pincode !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete pincode');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Pincode Serviceability</h1>

      <div className="mobile-stack" style={{ display: 'flex', gap: '24px' }}>
        
        {/* Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
            <h3 style={{ margin: '0 0 16px' }}>Add Single Pincode</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>Pincode</label>
                <input type="text" value={newPin} onChange={e => setNewPin(e.target.value)} style={styles.input} required maxLength={6} />
              </div>
              <div>
                <label style={styles.label}>Estimated Delivery (Days)</label>
                <input type="number" value={newDays} onChange={e => setNewDays(e.target.value)} style={styles.input} required />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newCod} onChange={e => setNewCod(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                <span>COD Available</span>
              </label>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus size={16} /> Add Pincode
              </button>
            </form>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
            <h3 style={{ margin: '0 0 16px' }}>Bulk Upload</h3>
            <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '32px', textAlign: 'center', background: '#f9f9f9' }}>
              <UploadCloud size={32} color="#888" style={{ marginBottom: '8px' }} />
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Drag & Drop CSV File</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Format: pincode, days, cod_allowed</p>
            </div>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '16px' }}>Download Template</button>
          </div>
        </div>

        {/* List */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', flex: 2 }}>
          <h3 style={{ margin: '0 0 16px' }}>Serviceable Pincodes ({pincodes.length})</h3>
          <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
            <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Pincode</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>Days</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600 }}>COD</th>
                <th style={{ padding: '12px 16px', color: '#555', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center' }}>Loading pincodes...</td></tr>
              ) : pincodes.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No pincodes found.</td></tr>
              ) : (
                pincodes.map((pin, i) => (
                  <tr key={pin.id || i} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace' }}>{pin.pincode}</td>
                    <td style={{ padding: '12px 16px' }}>{pin.estimatedDays}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {pin.codAvailable ? <span style={{ color: '#166534' }}>Yes</span> : <span style={{ color: '#dc2626' }}>No</span>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => handleDelete(pin.id || pin.pincode)} style={{ padding: '6px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
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
  }
};

export default Pincodes;
