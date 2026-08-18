import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useRecentlyViewedStore from '../../store/useRecentlyViewedStore';
import ProductCard from './ProductCard';
import RevealGrid from '../common/RevealGrid';
import RevealCard from '../common/RevealCard';

const RecentlyViewedStrip = ({ onQuickView }) => {
  const { items } = useRecentlyViewedStore();
  const carouselRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  if (!items || items.length === 0) return null;

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      const scrollAmount = 350;
      carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
      style={{ marginTop: 'var(--spacing-xxl)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ margin: 0, fontWeight: 700 }}>Recently Viewed</h2>
        
        {items.length > 4 && (
          <div className="hide-mobile" style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => scrollCarousel('left')} 
              className="btn btn-outline" 
              style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scrollCarousel('right')} 
              className="btn btn-outline" 
              style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <RevealGrid 
        ref={carouselRef}
        style={{ 
          display: 'flex', gap: 'var(--spacing-lg)', overflowX: 'auto', paddingBottom: 'var(--spacing-md)',
          scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none'
        }}
        className="no-scrollbar"
      >
        {items.map((product, index) => (
          <RevealCard key={product.id} index={index} className="carousel-card" style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
            <ProductCard product={product} onQuickView={onQuickView} />
          </RevealCard>
        ))}
      </RevealGrid>
    </motion.div>
  );
};

export default RecentlyViewedStrip;
