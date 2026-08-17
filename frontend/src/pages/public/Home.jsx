import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';
import QuickViewModal from '../../components/product/QuickViewModal';
import NewArrivals from '../../components/product/NewArrivals';
import BestSellers from '../../components/product/BestSellers';
import WhyMalkinCraft from '../../components/home/WhyMalkinCraft';
import BrandStory from '../../components/home/BrandStory';
import HomePromo from '../../components/home/HomePromo';
import ReviewsCarousel from '../../components/home/ReviewsCarousel';
import RecentlyViewedStrip from '../../components/product/RecentlyViewedStrip';
import TrustHighlights from '../../components/home/TrustHighlights';
import SocialGallery from '../../components/home/SocialGallery';
import NewsletterSignup from '../../components/home/NewsletterSignup';
import SEO from '../../components/common/SEO';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=1600&auto=format&fit=crop',
    title: 'Handcrafted Elegance',
    subtitle: 'Discover jewelry designed with intention and crafted by master artisans.',
    cta: 'Explore Collection',
    link: '/shop'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1600&auto=format&fit=crop',
    title: 'The Terracotta Collection',
    subtitle: 'Earthy tones and warm metals, perfect for the modern minimalist.',
    cta: 'Shop New Arrivals',
    link: '/shop'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?q=80&w=1600&auto=format&fit=crop',
    title: 'Rooted in Tradition',
    subtitle: 'Every piece tells a story of heritage, skill, and passion.',
    cta: 'Our Craft Story',
    link: '/about'
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  const shouldReduceMotion = useReducedMotion();

  // Auto-advance hero carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Easing definitions
  const premiumEase = [0.25, 1, 0.5, 1]; // elastic/soft cubic-bezier

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: premiumEase }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: premiumEase } }
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
          position: 'relative', height: '80vh', overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginTop: '-var(--spacing-xl)', background: '#000'
        }}
        onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: shouldReduceMotion ? 1 : 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.8, ease: premiumEase }, scale: { duration: 20, ease: 'linear' } }}
            style={{
              position: 'absolute', inset: 0, backgroundImage: `url(${slides[currentSlide].image})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>
        
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '0 20px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} initial="hidden" animate="visible" exit="hidden" variants={containerVariants}>
              <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: 'var(--spacing-md)', color: 'white', fontWeight: 400, fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {slides[currentSlide].title}
              </motion.h1>

              <motion.p variants={itemVariants} style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: 'var(--spacing-xl)', maxWidth: '600px', margin: '0 auto var(--spacing-xl)', opacity: 0.9, fontWeight: 400 }}>
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to={slides[currentSlide].link} className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', background: 'white', color: 'black', border: 'none', fontWeight: 600, borderRadius: '4px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {slides[currentSlide].cta}
                </Link>
                <Link to="/about" className="btn btn-outline" style={{ padding: '16px 36px', fontSize: '1.05rem', background: 'transparent', color: 'white', border: '1px solid white', fontWeight: 500, borderRadius: '4px', display: 'inline-block' }}>
                  Our Story
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hide-mobile" style={{ position: 'absolute', bottom: '30px', display: 'flex', gap: '10px', zIndex: 2 }}>
          {slides.map((_, idx) => (
            <button
              key={idx} onClick={() => setCurrentSlide(idx)}
              style={{ width: currentSlide === idx ? '28px' : '10px', height: '10px', borderRadius: '5px', background: currentSlide === idx ? 'white' : 'rgba(255,255,255,0.4)', transition: shouldReduceMotion ? 'none' : 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <QuickViewModal isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} product={quickViewProduct} />

      {/* 2. Featured Categories (Minimal Visual Circles) */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionVariants} className="container" style={{ marginTop: 'var(--spacing-xxl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center', fontWeight: 700, fontSize: '1.8rem' }}>Shop by Category</h2>
        <RevealGrid style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-2xl)', flexWrap: 'wrap' }}>
          {[
            { title: 'Necklaces', img: 'https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=400&auto=format&fit=crop' },
            { title: 'Rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=400&auto=format&fit=crop' },
            { title: 'Earrings', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop' },
            { title: 'Bracelets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop' },
          ].map((cat, idx) => (
            <RevealCard key={idx} index={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <Link to={`/shop?q=${cat.title.toLowerCase()}`} style={{ display: 'block', textDecoration: 'none' }}>
                <motion.div whileHover={shouldReduceMotion ? {} : { scale: 1.05 }} transition={{ duration: 0.4, ease: premiumEase }} style={{ width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
                  <img src={cat.img} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.div>
                <h3 style={{ textAlign: 'center', margin: '12px 0 0 0', fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-main)' }}>{cat.title}</h3>
              </Link>
            </RevealCard>
          ))}
        </RevealGrid>
      </motion.div>

      {/* 3. Best Sellers */}
      <BestSellers onQuickView={handleQuickView} />

      {/* 4. New Arrivals */}
      <NewArrivals onQuickView={handleQuickView} />

      {/* 5. Why MalkinCraft */}
      <WhyMalkinCraft />

      {/* 6. Brand/Artisan Story */}
      <BrandStory />

      {/* 7. Promo Banner */}
      <HomePromo />

      {/* 8. Customer Reviews */}
      <ReviewsCarousel />

      {/* 9. Recently Viewed Strip */}
      <RecentlyViewedStrip onQuickView={handleQuickView} />

      {/* 10. Social Gallery */}
      <SocialGallery />

      {/* 11. Newsletter */}
      <NewsletterSignup />

      {/* 12. Trust Highlights */}
      <TrustHighlights />

    </div>
  );
};

export default Home;
