import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, RefreshCcw, Truck, Award } from 'lucide-react';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';

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
  const [bestSellers, setBestSellers] = useState([]);
  const [settings, setSettings] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const carouselRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Fetch Best Sellers
    api.get('/products?isBestSeller=true')
      .then(res => setBestSellers(res.data.data.products.slice(0, 8)))
      .catch(console.error);

    // Fetch Settings for Trust Badges
    api.get('/store/settings')
      .then(res => setSettings(res.data.data || {}))
      .catch(console.error);
  }, []);

  // Auto-advance hero carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      const scrollAmount = 350;
      carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: premiumEase }
    }
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Hero Carousel */}
      <div 
        style={{ 
          position: 'relative', 
          height: '80vh', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-var(--spacing-xl)',
          background: '#000'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: shouldReduceMotion ? 1 : 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: 0.8, ease: premiumEase },
              scale: { duration: 20, ease: 'linear' }
            }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${slides[currentSlide].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>
        
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '0 20px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
            >
              <motion.h1 
                variants={itemVariants}
                style={{ 
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
                  marginBottom: 'var(--spacing-md)', 
                  color: 'white',
                  fontWeight: 400,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.1
                }}
              >
                {slides[currentSlide].title}
              </motion.h1>

              <motion.p
                variants={itemVariants}
                style={{ 
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
                  marginBottom: 'var(--spacing-xl)', 
                  maxWidth: '600px', 
                  margin: '0 auto var(--spacing-xl)',
                  opacity: 0.9,
                  fontWeight: 400
                }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.div variants={itemVariants}>
                <Link 
                  to={slides[currentSlide].link} 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '16px 36px', 
                    fontSize: '1.05rem', 
                    background: 'white', 
                    color: 'black',
                    border: 'none',
                    fontWeight: 600,
                    borderRadius: '4px',
                    display: 'inline-block',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {slides[currentSlide].cta}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Dots */}
        <div className="hide-mobile" style={{ position: 'absolute', bottom: '30px', display: 'flex', gap: '10px', zIndex: 2 }}>
          {slides.map((_, idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: isActive ? '28px' : '10px', 
                  height: '10px', 
                  borderRadius: '5px',
                  background: isActive ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: shouldReduceMotion ? 'none' : 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Trust Badges Row */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        style={{ background: 'var(--color-surface)', padding: 'var(--spacing-lg) 0', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="container responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', textAlign: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={32} color="var(--color-primary)" strokeWidth={1.5} />
            <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>Secure Payments</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <RefreshCcw size={32} color="var(--color-primary)" strokeWidth={1.5} />
            <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>{settings.returnWindowDays ? `${settings.returnWindowDays} Day Returns` : 'Easy Returns'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Truck size={32} color="var(--color-primary)" strokeWidth={1.5} />
            <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>{settings.freeShippingThreshold ? `Free Shipping Above ₹${settings.freeShippingThreshold}` : 'Free Fast Shipping'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Award size={32} color="var(--color-primary)" strokeWidth={1.5} />
            <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>1 Year Warranty</span>
          </div>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionVariants}
        className="container" 
        style={{ marginTop: 'var(--spacing-xxl)' }}
      >
        <h2 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center', fontWeight: 700 }}>Shop by Category</h2>
        <RevealGrid 
          className="responsive-grid" 
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        >
          {[
            { title: 'Necklaces', img: 'https://picsum.photos/seed/cat1/600/800' },
            { title: 'Rings', img: 'https://picsum.photos/seed/cat2/600/800' },
            { title: 'Earrings', img: 'https://picsum.photos/seed/cat3/600/800' },
            { title: 'Bracelets', img: 'https://picsum.photos/seed/cat4/600/800' },
          ].map((cat, idx) => (
            <RevealCard 
              key={idx} 
              index={idx}
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            >
              <Link to="/shop" style={{ position: 'relative', overflow: 'hidden', display: 'block', height: '350px' }}>
                <motion.div 
                  whileHover={shouldReduceMotion ? {} : { scale: 1.04 }} 
                  transition={{ duration: 0.45, ease: premiumEase }}
                  style={{ width: '100%', height: '100%', backgroundImage: `url(${cat.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
                <h3 style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>{cat.title}</h3>
              </Link>
            </RevealCard>
          ))}
        </RevealGrid>
      </motion.div>

      {/* Best Sellers Carousel */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionVariants}
        className="container" 
        style={{ marginTop: 'var(--spacing-xxl)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Best Sellers</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="hide-mobile" style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => scrollCarousel('left')} 
                className="btn btn-outline" 
                style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scrollCarousel('right')} 
                className="btn btn-outline" 
                style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)', fontWeight: 600 }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <RevealGrid 
          ref={carouselRef}
          style={{ 
            display: 'flex', 
            gap: 'var(--spacing-lg)', 
            overflowX: 'auto', 
            paddingBottom: 'var(--spacing-md)',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          className="no-scrollbar"
        >
          {bestSellers.map((product, index) => (
            <RevealCard key={product.id} index={index} style={{ minWidth: '280px', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <ProductCard product={product} />
            </RevealCard>
          ))}
          {bestSellers.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', width: '100%', color: 'var(--color-text-muted)' }}>
              Loading best sellers...
            </div>
          )}
        </RevealGrid>
      </motion.div>

      {/* Craft Story Section */}
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
            <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>The Art of Craft</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)', fontSize: '1.1rem', lineHeight: 1.8 }}>
              We believe that true luxury lies in the details. Every piece of MalkinCraft jewelry begins its journey in the hands of master artisans who have spent decades perfecting their craft. From selecting ethically sourced materials to the final polish, our process honors traditional techniques while embracing modern design.
            </p>
            <Link to="/about" className="btn btn-outline" style={{ display: 'inline-block' }}>
              Read Our Story
            </Link>
          </div>
          <div style={{ position: 'relative', height: '450px', borderRadius: '4px', overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1620050843105-06d91d0637c3?q=80&w=800&auto=format&fit=crop" 
              alt="Artisan crafting jewelry" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>
      </motion.div>

      {/* Instagram / UGC Grid */}
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
                  transition={{ duration: 0.4, ease: premiumEase }}
                  src={`https://picsum.photos/seed/ugc${num}/600/600`} 
                  alt="Customer styled" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)', opacity: 0, transition: 'opacity 0.3s' }} className="hover-target" />
              </Link>
            </RevealCard>
          ))}
        </RevealGrid>
      </motion.div>
    </div>
  );
};

export default Home;
