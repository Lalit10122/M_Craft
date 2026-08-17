import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BrandStory = () => {
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
      style={{ marginTop: 'var(--spacing-3xl)', marginBottom: 'var(--spacing-3xl)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-heading)' }}>The Art of Craft</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)', fontSize: '1.1rem', lineHeight: 1.8 }}>
            We believe that true luxury lies in the details. Every piece of MalkinCraft jewelry begins its journey in the hands of master artisans who have spent decades perfecting their craft. From selecting ethically sourced materials to the final polish, our process honors traditional techniques while embracing modern design.
          </p>
          <Link to="/about" className="btn btn-outline" style={{ display: 'inline-block', padding: '12px 24px', fontSize: '1rem' }}>
            Read Our Story
          </Link>
        </div>
        <div style={{ position: 'relative', height: '450px', borderRadius: '4px', overflow: 'hidden' }}>
          <img 
            src="https://images.unsplash.com/photo-1620050843105-06d91d0637c3?q=80&w=800&auto=format&fit=crop" 
            alt="Artisan crafting jewelry" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            loading="lazy"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default BrandStory;
