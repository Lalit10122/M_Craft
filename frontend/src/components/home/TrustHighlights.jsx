import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCcw, Truck, Award } from 'lucide-react';
import api from '../../utils/api';

const TrustHighlights = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/store/settings')
      .then(res => setSettings(res.data.data || {}))
      .catch(console.error);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      style={{ background: 'var(--color-surface)', padding: 'var(--spacing-lg) 0', borderBottom: '1px solid var(--color-border)', borderTop: '1px solid var(--color-border)' }}
    >
      <div className="container responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', textAlign: 'center', gap: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={32} color="var(--color-primary)" strokeWidth={1.5} />
          <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>Secure Payments</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <RefreshCcw size={32} color="var(--color-primary)" strokeWidth={1.5} />
          <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>{settings.returnWindowDays ? `${settings.returnWindowDays} Day Returns` : 'Easy Returns'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Truck size={32} color="var(--color-primary)" strokeWidth={1.5} />
          <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>{settings.freeShippingThreshold ? `Free Shipping Above ₹${settings.freeShippingThreshold}` : 'Free Fast Shipping'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Award size={32} color="var(--color-primary)" strokeWidth={1.5} />
          <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>1 Year Warranty</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrustHighlights;
