import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const NewsletterSignup = ({ data }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
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

  const content = data || {
    image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=800&auto=format&fit=crop',
    heading_normal: 'Join the',
    heading_italic: 'Inner Circle',
    description: 'Subscribe to receive updates on new arrivals, special offers, and our latest stories.'
  };

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionVariants}
      className="container"
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        background: 'var(--color-primary)', 
        color: 'white',
        minHeight: '400px',
        overflow: 'hidden'
      }}>
        {/* Left Side: Image */}
        <div style={{ position: 'relative', minHeight: '300px' }}>
          <img 
            src={content.image} 
            alt="Newsletter visual" 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          />
        </div>

        {/* Right Side: Content */}
        <div style={{ padding: 'var(--spacing-3xl) var(--spacing-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-heading)', fontWeight: 400 }}>
            {content.heading_normal} <br /><span style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>{content.heading_italic}</span>
          </h2>
          <p style={{ margin: '0 0 var(--spacing-xl) 0', fontSize: '1.1rem', opacity: 0.9, maxWidth: '400px' }}>
            {content.description}
          </p>

          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <CheckCircle2 size={32} color="var(--color-accent)" />
              <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>{message}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.3)', transition: 'border-color 0.3s ease' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    padding: '16px 0', 
                    fontSize: '1rem', 
                    outline: 'none',
                    color: 'white'
                  }}
                  className="newsletter-input"
                />
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  style={{ background: 'transparent', border: 'none', color: 'white', padding: '0 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {status === 'loading' ? '...' : <Send size={20} />}
                </button>
              </div>
              {status === 'error' && <p style={{ color: 'var(--color-error)', margin: 0, fontSize: '0.9rem' }}>{message}</p>}
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NewsletterSignup;
