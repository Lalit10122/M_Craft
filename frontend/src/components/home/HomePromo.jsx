import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomePromo = () => {
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
      style={{ position: 'relative', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'var(--spacing-3xl)' }}
    >
      {/* Background Image */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img 
          src="https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=1600&auto=format&fit=crop" 
          alt="Promotional Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      </div>

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', maxWidth: '800px', padding: 'var(--spacing-2xl) 0' }}>
        <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '16px', display: 'block', fontWeight: 600 }}>Limited Time Offer</span>
        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'var(--font-heading)', margin: '0 0 var(--spacing-md) 0', lineHeight: 1.1 }}>
          The Summer Solstice Collection
        </h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: 'var(--spacing-xl)', lineHeight: 1.6 }}>
          Embrace the warmth with our newly curated selection of sun-kissed gold and vibrant gemstones. Designed for the longest days and endless nights.
        </p>
        <Link 
          to="/collections" 
          className="btn btn-primary" 
          style={{ padding: '16px 36px', fontSize: '1.05rem', background: 'white', color: 'black', border: 'none', fontWeight: 600, borderRadius: '4px' }}
        >
          Explore Collection
        </Link>
      </div>
    </motion.div>
  );
};

export default HomePromo;
