import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle } from 'lucide-react';

const ReturnRequestForm = ({ order, isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('Wrong item');
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(order.id, { reason, comment, file });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.overlay}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={styles.modal}
            className="glass-panel"
          >
            <div style={styles.header}>
              <h3>Request Return</h3>
              <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Reason for Return</label>
                <select 
                  className="input-field" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="Wrong item">Wrong item</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Doesn't match description">Doesn't match description</option>
                  <option value="Changed my mind">Changed my mind</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label>Additional Comments (Optional)</label>
                <textarea 
                  className="input-field" 
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more about the issue..."
                />
              </div>

              <div style={styles.formGroup}>
                <label>Photo Proof (Optional)</label>
                <div style={styles.fileUpload}>
                  <Upload size={20} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    Click to upload a photo of the item
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                {file && <div style={styles.fileSelected}><CheckCircle size={14} color="var(--color-success)"/> {file.name}</div>}
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Request</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    padding: 'var(--spacing-lg)',
    backgroundColor: 'white', // fallback
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-lg)',
  },
  closeBtn: {
    color: 'var(--color-text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  fileUpload: {
    border: '1px dashed var(--color-border)',
    borderRadius: '4px',
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    position: 'relative',
    background: '#f9f9f9',
    transition: 'background var(--transition-fast)',
  },
  fileSelected: {
    fontSize: '0.8rem',
    color: 'var(--color-success)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px'
  }
};

export default ReturnRequestForm;
