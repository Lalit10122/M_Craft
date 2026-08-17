import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              style={{
                background: '#1a1a1a',
                color: 'white',
                padding: '16px 20px',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                minWidth: '300px'
              }}
            >
              {toast.type === 'success' && <CheckCircle2 color="#16a34a" size={24} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{toast.title}</div>
                {toast.message && <div style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '4px' }}>{toast.message}</div>}
              </div>
              {toast.action && (
                <button 
                  onClick={() => {
                    toast.action.onClick(navigate);
                    removeToast(toast.id);
                  }}
                  style={{ background: 'white', color: '#111', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  {toast.action.label}
                </button>
              )}
              <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}>
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
