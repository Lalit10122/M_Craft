import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RevealGrid from '../common/RevealGrid';
import RevealCard from '../common/RevealCard';

const SocialGallery = () => {
  const shouldReduceMotion = useReducedMotion();
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
      className="container" 
      style={{ marginTop: 'var(--spacing-xxl)', marginBottom: 'var(--spacing-xxl)' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontWeight: 700 }}>Spotted on You</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Tag us @AureliaJewels to be featured</p>
      </div>
      
      <RevealGrid 
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}
      >
        {[1, 2, 3, 4].map((num, idx) => (
          <RevealCard 
            key={num}
            index={idx}
            style={{ borderRadius: '12px', overflow: 'hidden' }}
          >
            <Link to="/shop" style={{ position: 'relative', aspectRatio: '1/1', background: '#eee', display: 'block' }}>
              <motion.img 
                whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                src={`https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=400&auto=format&fit=crop`} 
                alt="Customer styled" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)', opacity: 0, transition: 'opacity 0.3s' }} className="hover-target" />
            </Link>
          </RevealCard>
        ))}
      </RevealGrid>
    </motion.div>
  );
};

export default SocialGallery;
