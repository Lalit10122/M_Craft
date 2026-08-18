import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import styles from './PDP.module.css';

const ProductPricing = ({ product, quantity, onQuantityChange }) => {
  const [qty, setQty] = useState(quantity || 1);
  const isDiscounted = product?.mrp > product?.basePrice;
  const stockQty = product?.stockQty ?? 0;
  const isInStock = stockQty > 0;

  const handleQtyChange = (delta) => {
    const newQty = Math.max(1, Math.min(qty + delta, stockQty || 10));
    setQty(newQty);
    if (onQuantityChange) onQuantityChange(newQty);
  };

  return (
    <div className={styles.pricingSection}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={product?.basePrice}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={styles.pricingWrapper}
        >
          <div className={styles.priceRow}>
            <span className={styles.basePrice}>₹{product?.basePrice}</span>
            {isDiscounted && (
              <span className={styles.mrp}>₹{product.mrp}</span>
            )}
          </div>

          {/* Quantity selector */}
          <div className={styles.qtySelector}>
            <button
              className={styles.qtyBtn}
              onClick={() => handleQtyChange(-1)}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className={styles.qtyValue}>{qty}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => handleQtyChange(1)}
              disabled={qty >= (stockQty || 10)}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stock status */}
      <div className={styles.stockStatus}>
        {isInStock ? (
          <span className={styles.inStock}>In Stock ({stockQty})</span>
        ) : (
          <span className={styles.outOfStock}>Out of Stock</span>
        )}
      </div>
    </div>
  );
};

export default ProductPricing;
