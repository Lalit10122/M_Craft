import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import RevealGrid from '../common/RevealGrid';
import RevealCard from '../common/RevealCard';

const reviews = [
  { id: 1, author: "Sarah M.", text: "Absolutely stunning piece. The craftsmanship is visible in every detail.", rating: 5 },
  { id: 2, author: "Priya K.", text: "I wear my Terracotta necklace every day. It's so lightweight and unique.", rating: 5 },
  { id: 3, author: "Emily R.", text: "Fast shipping and beautiful packaging. It felt like opening a special gift.", rating: 5 },
  { id: 4, author: "Jessica L.", text: "The quality exceeds the price. Will definitely be purchasing more.", rating: 5 },
  { id: 5, author: "Anita T.", text: "Gorgeous earrings! I receive compliments everywhere I go.", rating: 5 }
];

const ReviewsCarousel = () => {
  const carouselRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

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
      style={{ background: '#f9f9f9', padding: 'var(--spacing-3xl) 0', marginTop: 'var(--spacing-xxl)' }}
    >
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-xl)' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '2rem' }}>Words of Love</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: '8px 0 0 0' }}>Over 10,000 happy customers</p>
          </div>
          
          <div className="hide-mobile" style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => scrollCarousel('left')} 
              className="btn btn-outline" 
              style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scrollCarousel('right')} 
              className="btn btn-outline" 
              style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <RevealGrid 
          ref={carouselRef}
          style={{ 
            display: 'flex', gap: 'var(--spacing-lg)', overflowX: 'auto', paddingBottom: 'var(--spacing-md)',
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none'
          }}
          className="no-scrollbar"
        >
          {reviews.map((review, index) => (
            <RevealCard key={review.id} index={index} style={{ minWidth: '320px', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <div style={{ background: 'white', padding: 'var(--spacing-xl)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', color: '#fbbf24', marginBottom: '16px' }}>
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '24px', flex: 1, fontStyle: 'italic', color: '#444' }}>
                  "{review.text}"
                </p>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>— {review.author}</div>
              </div>
            </RevealCard>
          ))}
        </RevealGrid>
      </div>
    </motion.div>
  );
};

export default ReviewsCarousel;
