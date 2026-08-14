import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { AlertTriangle, Copy, Check } from 'lucide-react';

const AdminTwoFactorSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tempToken = location.state?.tempToken;

  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackups, setCopiedBackups] = useState(false);
  const [ackSaved, setAckSaved] = useState(false);

  useEffect(() => {
    if (!tempToken) {
      navigate('/admin/login');
      return;
    }

    const fetchSetup = async () => {
      try {
        const res = await api.post('/auth/admin/2fa/setup', { tempToken });
        setSetupData(res.data.data);
      } catch (err) {
        setError('Failed to initialize 2FA setup.');
      }
    };
    fetchSetup();
  }, [tempToken, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/admin/2fa/verify-setup', {
        tempToken,
        code
      });
      setBackupCodes(res.data.data.backupCodes);
      localStorage.setItem('adminToken', res.data.data.token);
    } catch (err) {
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackups(true);
      setTimeout(() => setCopiedBackups(false), 2000);
    }
  };

  const handleFinish = () => {
    if (ackSaved) {
      navigate('/admin');
    }
  };

  if (!setupData) {
    return <div style={{...styles.container, color: 'white'}}>Loading setup...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {!backupCodes ? (
          // Step 1: Scan QR & Verify
          <>
            <h2 style={{ marginBottom: '8px', fontSize: '1.5rem', color: '#111' }}>Set Up 2FA</h2>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.95rem' }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.).
            </p>
            
            {error && <div style={styles.errorBanner}>{error}</div>}

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <img src={setupData.qrCodeUrl} alt="2FA QR Code" style={{ width: '200px', height: '200px', marginBottom: '16px' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <code style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: '4px', letterSpacing: '1px' }}>
                  {setupData.secret}
                </code>
                <button 
                  onClick={() => copyToClipboard(setupData.secret, 'secret')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                  title="Copy Secret"
                >
                  {copiedSecret ? <Check size={18} color="green" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="6-digit code"
                value={code} 
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ ...styles.input, flex: 1, textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                required
              />
              <button type="submit" disabled={loading || code.length !== 6} style={{ ...styles.button, width: 'auto' }}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          </>
        ) : (
          // Step 2: Backup Codes Acknowledgment
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#991b1b' }}>
              <AlertTriangle size={24} />
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Save Your Backup Codes</h2>
            </div>
            
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              If you lose access to your authenticator app, you can use these codes to sign in. 
              <strong> You will only see these codes once.</strong> Please copy them and save them somewhere safe.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                {backupCodes.map((bc, i) => (
                  <div key={i}>{bc}</div>
                ))}
              </div>
              <button 
                onClick={() => copyToClipboard(backupCodes.join('\n'), 'backups')}
                style={{ ...styles.button, background: '#e2e8f0', color: '#334155', marginTop: '16px' }}
              >
                {copiedBackups ? <><Check size={16} style={{display:'inline', verticalAlign:'text-bottom'}}/> Copied!</> : <><Copy size={16} style={{display:'inline', verticalAlign:'text-bottom'}}/> Copy All Codes</>}
              </button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={ackSaved} 
                onChange={(e) => setAckSaved(e.target.checked)} 
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>I have saved my backup codes securely.</span>
            </label>

            <button 
              onClick={handleFinish} 
              disabled={!ackSaved} 
              style={{ ...styles.button, opacity: ackSaved ? 1 : 0.5, cursor: ackSaved ? 'pointer' : 'not-allowed' }}
            >
              Continue to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111',
  },
  card: {
    background: '#fff',
    padding: '48px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  input: {
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1rem',
  },
  button: {
    padding: '14px',
    background: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '16px',
    border: '1px solid #f87171'
  }
};

export default AdminTwoFactorSetup;
