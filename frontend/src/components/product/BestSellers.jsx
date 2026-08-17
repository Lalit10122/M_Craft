import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import RevealGrid from '../common/RevealGrid';
import RevealCard from '../common/RevealCard';

const BestSellers = ({ onQuickView }) => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setLoading(true);
    api.get('/products?isBestSeller=true&limit=8')
      .then(res => setBestSellers(res.data.data.products || res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        <h2 style={{ margin: 0, fontWeight: 700 }}>Best Sellers</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <Link to="/shop?sort=bestselling" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)', fontWeight: 600 }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div 
          style={{ 
            display: 'flex', gap: 'var(--spacing-lg)', overflowX: 'auto', paddingBottom: 'var(--spacing-md)',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
          }}
          className="no-scrollbar"
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ minWidth: '280px', flexShrink: 0 }}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : bestSellers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#fafafa', borderRadius: '8px' }}>
          No best sellers found.
        </div>
      ) : (
        <RevealGrid 
          key="best-sellers-grid"
          ref={carouselRef}
          style={{ 
            display: 'flex', gap: 'var(--spacing-lg)', overflowX: 'auto', paddingBottom: 'var(--spacing-md)',
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none'
          }}
          className="no-scrollbar"
        >
          {bestSellers.map((product, index) => (
            <RevealCard key={product.id} index={index} style={{ minWidth: '280px', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <ProductCard product={product} onQuickView={onQuickView} />
            </RevealCard>
          ))}
        </RevealGrid>
      )}
    </motion.div>
  );
};

export default BestSellers;
