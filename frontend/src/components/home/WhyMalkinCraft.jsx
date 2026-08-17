import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Leaf, Hand, ShieldCheck, HeartHandshake } from 'lucide-react';

const WhyMalkinCraft = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  const features = [
    { icon: <Hand size={32} strokeWidth={1.5} />, title: 'Handcrafted', text: 'Made by artisans, not machines.' },
    { icon: <Leaf size={32} strokeWidth={1.5} />, title: 'Sustainable', text: 'Ethically sourced materials.' },
    { icon: <ShieldCheck size={32} strokeWidth={1.5} />, title: 'Quality Assured', text: 'Rigorous testing standards.' },
    { icon: <HeartHandshake size={32} strokeWidth={1.5} />, title: 'Fair Trade', text: 'Supporting local communities.' }
  ];

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionVariants}
      style={{ background: 'var(--color-surface)', padding: 'var(--spacing-2xl) 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', margin: '0 0 8px 0' }}>Why MalkinCraft?</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-xl)', textAlign: 'center' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--color-primary)' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{f.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WhyMalkinCraft;
