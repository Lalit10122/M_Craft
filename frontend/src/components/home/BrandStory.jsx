import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BrandStory = ({ data }) => {
  const shouldReduceMotion = useReducedMotion();
  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  const content = data || {
    background_text: 'Artisanal',
    heading_normal: 'The Art of',
    heading_italic: 'Craft',
    description: 'We believe that true luxury lies in the details. Every piece of MalkinCraft jewelry begins its journey in the hands of master artisans who have spent decades perfecting their craft. From selecting ethically sourced materials to the final polish, our process honors traditional techniques while embracing modern design.',
    button_text: 'Read Our Story',
    button_link: '/about',
    image: 'https://images.unsplash.com/photo-1620050843105-06d91d0637c3?q=80&w=800&auto=format&fit=crop',
    badge_top: 'Established',
    badge_bottom: 'Jaipur, India'
  };

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
      className="container" 
      style={{ marginTop: 'var(--spacing-3xl)', marginBottom: 'var(--spacing-3xl)', position: 'relative' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Large Decorative Text (Background) */}
        <div className="hide-mobile" style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          fontSize: '12vw',
          fontFamily: 'var(--font-heading)',
          fontWeight: 400,
          color: 'var(--color-border)',
          opacity: 0.3,
          zIndex: 0,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
          lineHeight: 0.8
        }}>
          {content.background_text}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-3xl)', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          
          <div style={{ position: 'relative', paddingTop: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-heading)', fontWeight: 400, lineHeight: 1.1, color: 'var(--color-text-main)' }}>
              {content.heading_normal} <br /><span style={{ fontStyle: 'italic', color: 'var(--color-secondary)' }}>{content.heading_italic}</span>
            </h2>
            <div style={{ width: '60px', height: '1px', background: 'var(--color-text-main)', marginBottom: 'var(--spacing-xl)' }} />
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xl)', fontSize: '1.15rem', lineHeight: 1.8, maxWidth: '90%' }}>
              {content.description}
            </p>
            <Link to={content.button_link} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '0', fontSize: '1.05rem', border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {content.button_text}
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--color-border)', transition: 'all 0.3s ease' }}>→</span>
            </Link>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '100%', height: '100%', background: 'var(--color-background)', border: '1px solid var(--color-border)', zIndex: 0 }} />
            <div style={{ position: 'relative', height: '600px', zIndex: 1, boxShadow: 'var(--shadow-lg)' }}>
              <img 
                src={content.image} 
                alt="Brand visual" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                loading="lazy"
              />
            </div>
            
            {/* Small offset badge/caption */}
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', background: 'var(--color-surface)', padding: '16px 24px', zIndex: 2, boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{content.badge_top}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 400 }}>{content.badge_bottom}</span>
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
};

export default BrandStory;
