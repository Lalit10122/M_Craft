import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import styles from './PDP.module.css';

const StickyCartBar = ({ product, onAddToCart, added }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isOutOfStock = product?.stockQty === 0;

  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky bar when the user scrolls past the main buy button.
      // 500px is a rough estimate for mobile where the main CTA is passed.
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || !product) return null;

  return (
    <div className={`show-mobile-flex ${styles.stickyCartBar}`}>
      <div className={styles.stickyDetails}>
        <span className={styles.stickyTitle}>{product.name}</span>
        <span className={styles.stickyPrice}>₹{product.basePrice}</span>
      </div>
      <button 
        onClick={onAddToCart} 
        className={`btn btn-primary ${styles.stickyBtn}`}
        disabled={isOutOfStock}
      >
        <ShoppingBag size={18} />
        {added ? 'Added' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default StickyCartBar;
