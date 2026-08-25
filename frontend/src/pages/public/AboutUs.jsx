import React, { useRef, useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './AboutUs.module.css';

const premiumEase = [0.25, 1, 0.5, 1];

const processSteps = [
  { title: "Material Selection", desc: "Sourcing ethically mined stones and recycled metals from trusted global partners.", img: "https://images.unsplash.com/photo-1616428784110-4f51e06497f1?q=80&w=800&auto=format&fit=crop" },
  { title: "Design", desc: "Translating architectural forms into wearable silhouettes through countless sketches.", img: "https://images.unsplash.com/photo-1579294541743-f1f33f675662?q=80&w=800&auto=format&fit=crop" },
  { title: "Handcrafting", desc: "Master artisans bring the design to life using traditional techniques.", img: "https://images.unsplash.com/photo-1602164945488-322a0e0a09e4?q=80&w=800&auto=format&fit=crop" },
  { title: "Finishing", desc: "Meticulous polishing for that signature MalkinCraft glow.", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop" }
];

const artisans = [
  { name: "Elena R.", role: "Master Jeweler", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" },
  { name: "Marcus T.", role: "Stone Setter", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop" },
  { name: "Sarah K.", role: "Design Lead", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop" }
];

const WordReveal = ({ children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end center"]
  });

  const words = children.split(" ");
  
  return (
    <div ref={ref} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25em', justifyContent: 'center' }}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
        const y = useTransform(scrollYProgress, [start, end], [10, 0]);
        return (
          <motion.span key={i} style={{ opacity, y, display: 'inline-block' }}>
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};

const ProcessStep = ({ step, index, setActiveStep }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-200px 0px -200px 0px" }}
      onViewportEnter={() => setActiveStep(index)}
      transition={{ duration: 0.8, ease: premiumEase }}
      style={{ padding: '40vh 0', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
        <span style={{ fontSize: '1rem', display: 'block', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Phase 0{index + 1}</span>
        {step.title}
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1.8, maxWidth: '400px' }}>
        {step.desc}
      </p>
    </motion.div>
  );
};

const ArtisanPortrait = ({ artisan, index }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div 
      initial={{ filter: shouldReduceMotion ? 'grayscale(0%)' : 'grayscale(100%)', opacity: 0, y: 40 }}
      whileInView={{ filter: 'grayscale(0%)', opacity: 1, y: 0 }}
      whileHover={{ y: -10, transition: { duration: 0.4, ease: premiumEase } }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: premiumEase, delay: index * 0.1 }}
      style={{ textAlign: 'center', cursor: 'pointer' }}
    >
      <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', borderRadius: '2px', marginBottom: '1.5rem', background: '#f5f5f5' }}>
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: premiumEase }}
          src={artisan.img} alt={artisan.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>
      <h4 style={{ fontSize: '1.2rem', marginBottom: '4px', fontWeight: 500 }}>{artisan.name}</h4>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{artisan.role}</p>
    </motion.div>
  );
};

const AboutUs = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  const [activeStep, setActiveStep] = useState(0);
  const [content, setContent] = useState({
      hero_image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000&auto=format&fit=crop',
      process_images: processSteps.map(s => s.img),
      artisan_images: artisans.map(a => a.img)
  });

  useEffect(() => {
    api.get('/settings/public').then(res => {
      if (res.data?.data?.about_us_content) {
        setContent(res.data.data.about_us_content);
      }
    }).catch(console.error);
  }, []);

  
  // Parallax for hero
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div style={{ background: 'var(--color-background)' }}>
      {/* Editorial Hero */}
      <section style={{ position: 'relative', height: '100vh', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', overflow: 'hidden' }}>
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${content.hero_image})`,
            backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0,
            y: shouldReduceMotion ? 0 : heroY
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1 }} />
        
        <motion.div 
          style={{ position: 'relative', zIndex: 2, maxWidth: '900px', padding: '0 20px', opacity: heroOpacity }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: premiumEase, delay: 0.2 }}
            style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: 300, marginBottom: '24px', letterSpacing: '-2px', lineHeight: 1 }}
          >
            The Art of Craft
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', opacity: 0.9, fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase' }}
          >
            MalkinCraft Est. 2024
          </motion.p>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Scroll</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ width: '1px', height: '40px', background: 'white' }}
          />
        </motion.div>
      </section>

      {/* Philosophy Statement (Scroll Reveal) */}
      <section style={{ padding: 'clamp(100px, 15vh, 200px) 20px', textAlign: 'center', background: 'var(--color-background)', position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300, lineHeight: 1.4, color: 'var(--color-text)' }}>
            <WordReveal>
              Bridging the gap between everyday wear and timeless heirloom. We believe true luxury cannot be rushed. It requires patience, precision, and a deep respect for the materials.
            </WordReveal>
          </h2>
        </div>
      </section>

      {/* Process Flow - Split Screen Sticky */}
      <section style={{ position: 'relative', background: 'var(--color-background)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '1440px', margin: '0 auto' }}>
          
          {/* Left Side: Sticky Visuals */}
          <div style={{ flex: '1 1 50%', position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }} className="hide-mobile">
            <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '4/5', position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeStep}
                  src={content.process_images[activeStep] || processSteps[activeStep].img}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  transition={{ duration: 0.8, ease: premiumEase }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side: Scrolling Content */}
          <div style={{ flex: '1 1 50%', padding: '0 clamp(20px, 5vw, 80px)' }}>
            <div style={{ paddingTop: '20vh', paddingBottom: '20vh' }}>
              {processSteps.map((step, idx) => (
                <ProcessStep key={idx} step={step} index={idx} setActiveStep={setActiveStep} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Artisan Portraits */}
      <section style={{ background: '#fafafa', padding: 'clamp(100px, 15vh, 200px) 0' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: premiumEase }}
            style={{ textAlign: 'center', marginBottom: 'clamp(60px, 10vw, 100px)' }}
          >
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, letterSpacing: '-1px' }}>The Hands Behind<br/>The Craft</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(2rem, 4vw, 4rem)' }}>
            {artisans.map((artisan, idx) => (
              <ArtisanPortrait key={idx} artisan={{...artisan, img: content.artisan_images[idx] || artisan.img}} index={idx} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
