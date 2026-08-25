import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';
import QuickViewModal from '../../components/product/QuickViewModal';
import BestSellers from '../../components/product/BestSellers';
import BrandStory from '../../components/home/BrandStory';
import SocialGallery from '../../components/home/SocialGallery';
import NewsletterSignup from '../../components/home/NewsletterSignup';
import SEO from '../../components/common/SEO';
import api from '../../utils/api';

const defaultSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=1600&auto=format&fit=crop',
    title: 'Handcrafted Elegance',
    subtitle: 'Discover jewelry designed with intention and crafted by master artisans.',
    cta: 'Explore Collection',
    link: '/shop'
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [settings, setSettings] = useState({
    homepage_hero_slides: defaultSlides,
    homepage_brand_story: null,
    homepage_newsletter: null
  });
  
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    api.get('/settings/public').then(res => {
      if (res.data?.data) {
        setSettings(prev => ({
          ...prev,
          homepage_hero_slides: res.data.data.homepage_hero_slides || prev.homepage_hero_slides,
          homepage_brand_story: res.data.data.homepage_brand_story || null,
          homepage_newsletter: res.data.data.homepage_newsletter || null
        }));
      }
    }).catch(console.error);
  }, []);

  const slides = settings.homepage_hero_slides;

  // Auto-advance hero carousel
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  // Easing definitions
  const premiumEase = [0.25, 1, 0.5, 1]; // elastic/soft cubic-bezier

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 32 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: premiumEase }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: premiumEase } }
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  return (
    <div style={{ padding: 0 }}>
      <SEO 
        title="Handcrafted Jewelry | Minimal & Warm" 
        description="Discover premium handcrafted jewelry designed with intention and crafted by master artisans. Explore our unique collections of necklaces, rings, earrings, and bracelets."
      />
      {/* 1. Hero Carousel */}
      <div 
        style={{ 
          position: 'relative', height: '85vh', overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginTop: '-var(--spacing-xl)', background: '#000'
        }}
        onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}
      >
        <AnimatePresence initial={false}>
          {slides[currentSlide] && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: shouldReduceMotion ? 1 : 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.2, ease: premiumEase }, scale: { duration: 25, ease: 'linear' } }}
              style={{
                position: 'absolute', inset: 0, backgroundImage: `url(${slides[currentSlide].image})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }}
            />
          )}
        </AnimatePresence>
        
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '0 20px' }}>
          <AnimatePresence mode="wait">
            {slides[currentSlide] && (
              <motion.div key={currentSlide} initial="hidden" animate="visible" exit="hidden" variants={containerVariants}>
                <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(2rem, 8vw, 4.5rem)', marginBottom: 'var(--spacing-md)', color: 'white', fontWeight: 400, fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                  {slides[currentSlide].title}
                </motion.h1>

                <motion.p variants={itemVariants} style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: 'var(--spacing-xl)', maxWidth: '600px', margin: '0 auto var(--spacing-xl)', opacity: 0.9, fontWeight: 300 }}>
                  {slides[currentSlide].subtitle}
                </motion.p>

                <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to={slides[currentSlide].link} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1rem', background: 'white', color: 'black', border: 'none', fontWeight: 500, borderRadius: '2px', display: 'inline-block', letterSpacing: '0.05em' }}>
                    {slides[currentSlide].cta}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hide-mobile" style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '12px', zIndex: 2 }}>
          {slides.map((_, idx) => (
            <button
              key={idx} onClick={() => setCurrentSlide(idx)}
              style={{ width: currentSlide === idx ? '32px' : '8px', height: '4px', borderRadius: '2px', background: currentSlide === idx ? 'white' : 'rgba(255,255,255,0.4)', transition: shouldReduceMotion ? 'none' : 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <QuickViewModal isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} product={quickViewProduct} />

      {/* 2. Brand Story */}
      <div style={{ marginTop: 'var(--spacing-3xl)' }}>
        <BrandStory data={settings.homepage_brand_story} />
      </div>

      {/* 3. Curated Categories */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants} className="container" style={{ marginTop: 'var(--spacing-3xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'center', fontWeight: 400, fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-text-main)' }}>Curated Collections</h2>
        <RevealGrid className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'var(--spacing-lg)' }}>
          {[
            { title: 'Necklaces', img: 'https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=600&auto=format&fit=crop' },
            { title: 'Rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=600&auto=format&fit=crop' },
            { title: 'Earrings', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop' },
            { title: 'Bracelets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop' },
          ].map((cat, idx) => (
            <RevealCard key={idx} index={idx} style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}>
              <Link to={`/shop?q=${cat.title.toLowerCase()}`} style={{ display: 'block', textDecoration: 'none', overflow: 'hidden' }}>
                <motion.div 
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }} 
                  transition={{ duration: 0.6, ease: premiumEase }} 
                  style={{ width: '100%', aspectRatio: '3/4', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--color-background)' }}
                >
                  <img src={cat.img} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--color-text-main)' }}>{cat.title}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop</span>
                </div>
              </Link>
            </RevealCard>
          ))}
        </RevealGrid>
      </motion.div>

      {/* 4. Featured Collection */}
      <div style={{ marginTop: 'var(--spacing-3xl)' }}>
        <BestSellers onQuickView={handleQuickView} />
      </div>

      {/* 5. Social & Community */}
      <div style={{ marginTop: 'var(--spacing-3xl)' }}>
        <SocialGallery />
      </div>

      {/* 6. Newsletter */}
      <div style={{ marginTop: 'var(--spacing-3xl)', marginBottom: 'var(--spacing-3xl)' }}>
        <NewsletterSignup data={settings.homepage_newsletter} />
      </div>

    </div>
  );
};

export default Home;
