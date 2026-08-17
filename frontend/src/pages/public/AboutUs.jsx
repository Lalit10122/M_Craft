import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './AboutUs.module.css';

const premiumEase = [0.25, 1, 0.5, 1];

const processSteps = [
  { title: "Material Selection", desc: "Sourcing ethically mined stones and recycled metals." },
  { title: "Design", desc: "Translating architectural forms into wearable silhouettes." },
  { title: "Handcrafting", desc: "Master artisans bring the design to life using traditional techniques." },
  { title: "Finishing", desc: "Meticulous polishing for that signature MalkinCraft glow." },
  { title: "Quality Check", desc: "Rigorous inspection under magnification." },
  { title: "Packaging", desc: "Carefully placed in our sustainable, heirloom-quality boxes." },
  { title: "Delivery", desc: "Shipped securely to your door, ready to become your everyday armor." }
];

const artisans = [
  { name: "Elena R.", role: "Master Jeweler", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" },
  { name: "Marcus T.", role: "Stone Setter", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop" },
  { name: "Sarah K.", role: "Design Lead", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop" }
];

const ProcessStep = ({ step, index, progress }) => {
  const threshold = index / (processSteps.length - 1);
  const isActive = useTransform(progress, [threshold - 0.15, threshold], [0, 1]);
  const opacity = useTransform(isActive, [0, 1], [0.4, 1]);
  const color = useTransform(isActive, [0, 1], ['#cccccc', '#9c4f36']); // Terracotta active

  return (
    <motion.div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', opacity }}>
      <div style={{ position: 'relative', width: '24px' }}>
        <motion.div 
          style={{ 
            width: '12px', height: '12px', borderRadius: '50%', 
            background: color, 
            position: 'absolute', top: '8px', left: '6px', zIndex: 10,
            boxShadow: '0 0 0 4px var(--color-background)'
          }} 
        />
      </div>
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 400 }}>{step.title}</h3>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
      </div>
    </motion.div>
  );
};

const ArtisanPortrait = ({ artisan }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div 
      initial={{ filter: shouldReduceMotion ? 'grayscale(0%)' : 'grayscale(100%)', opacity: 0, y: 20 }}
      whileInView={{ filter: 'grayscale(0%)', opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-150px" }}
      transition={{ duration: 1.2, ease: premiumEase }}
      style={{ textAlign: 'center' }}
    >
      <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', borderRadius: '2px', marginBottom: '1rem' }}>
        <img src={artisan.img} alt={artisan.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <h4 style={{ fontSize: '1.2rem', marginBottom: '4px', fontWeight: 500 }}>{artisan.name}</h4>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{artisan.role}</p>
    </motion.div>
  );
};

const AboutUs = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const processRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: processRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div style={{ background: 'var(--color-background)' }}>
      {/* Editorial Hero */}
      <section style={{ position: 'relative', height: '70vh', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', overflow: 'hidden' }}>
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: shouldReduceMotion ? 1 : 1.05 }}
          transition={{ duration: 20, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000&auto=format&fit=crop')",
            backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1 }} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: premiumEase }}
          style={{ position: 'relative', zIndex: 2, maxWidth: '800px', padding: '0 20px' }}
        >
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.5px' }}>The Art of Craft</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, fontWeight: 300 }}>Bridging the gap between everyday wear and timeless heirloom.</p>
        </motion.div>
      </section>

      {/* Process Flow */}
      <section className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: premiumEase }}
          style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto var(--spacing-3xl)' }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 400, marginBottom: '1rem' }}>Our Journey</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.8 }}>
            True luxury cannot be rushed. It requires patience, precision, and a deep respect for the materials. Here is how a MalkinCraft piece comes to life.
          </p>
        </motion.div>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }} ref={processRef}>
          {/* Static background line */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '11px', width: '2px', background: 'var(--color-border)', zIndex: 1 }} />
          
          {/* Animated drawing line */}
          <motion.div 
            style={{ 
              position: 'absolute', top: 0, left: '11px', width: '2px', 
              background: 'var(--color-primary)', zIndex: 2,
              height: lineHeight,
              transformOrigin: 'top'
            }} 
          />

          <div style={{ paddingBottom: '2rem' }}>
            {processSteps.map((step, idx) => (
              <ProcessStep key={idx} step={step} index={idx} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </section>

      {/* Artisan Portraits */}
      <section style={{ background: 'white', padding: 'var(--spacing-3xl) 0' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: premiumEase }}
            style={{ textAlign: 'center', marginBottom: 'var(--spacing-xxl)' }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 400 }}>The Hands Behind the Craft</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-xl)' }}>
            {artisans.map((artisan, idx) => (
              <ArtisanPortrait key={idx} artisan={artisan} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
