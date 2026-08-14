import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PDP.module.css';

const ProductPricing = ({ product }) => {
  const isDiscounted = product?.mrp > product?.basePrice;
  const discountPercent = isDiscounted 
    ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100) 
    : 0;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div 
        key={product?.basePrice}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={styles.pricingWrapper}
      >
        <span className={styles.basePrice}>₹{product?.basePrice}</span>
        {isDiscounted && (
          <span className={styles.mrp}>₹{product.mrp}</span>
        )}
        {isDiscounted && (
          <span className={styles.discountBadge}>
            {discountPercent}% OFF
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductPricing;
