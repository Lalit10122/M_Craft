import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      // In a real app this would call an actual newsletter endpoint
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network request
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionVariants}
      style={{ 
        background: 'var(--color-primary)', 
        color: 'white', 
        padding: 'var(--spacing-3xl) 0',
        textAlign: 'center'
      }}
    >
      <div className="container" style={{ maxWidth: '600px' }}>
        <h2 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '2.2rem', fontFamily: 'var(--font-heading)' }}>Join the Inner Circle</h2>
        <p style={{ margin: '0 0 var(--spacing-xl) 0', fontSize: '1.1rem', opacity: 0.9 }}>
          Subscribe to receive updates on new arrivals, special offers, and our latest stories.
        </p>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
          >
            <CheckCircle2 size={48} color="#4ade80" />
            <p style={{ fontSize: '1.2rem', margin: 0 }}>{message}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', background: 'white', borderRadius: '4px', overflow: 'hidden', padding: '4px' }}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  padding: '16px', 
                  fontSize: '1rem', 
                  outline: 'none',
                  color: 'var(--color-text-main)'
                }}
              />
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="btn btn-primary"
                style={{ borderRadius: '4px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {status === 'loading' ? 'Subscribing...' : (
                  <>Subscribe <Send size={16} /></>
                )}
              </button>
            </div>
            {status === 'error' && <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9rem' }}>{message}</p>}
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default NewsletterSignup;
