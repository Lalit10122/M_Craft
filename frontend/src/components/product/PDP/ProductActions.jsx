import React from 'react';
import { ShoppingBag, Heart, CheckCircle, ShieldCheck } from 'lucide-react';
import styles from './PDP.module.css';

const ProductActions = ({ product, onAddToCart, added }) => {
  const isOutOfStock = product?.stockQty === 0;
  const isLowStock = product?.stockQty > 0 && product?.stockQty < 5;

  return (
    <div className={styles.actionsContainer}>
      {/* Scarcity Trigger */}
      {isLowStock && (
        <div className={styles.scarcityAlert}>
          <span className={styles.pulseDot}></span>
          Only {product.stockQty} left in stock - order soon!
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button 
          onClick={onAddToCart} 
          className={`btn btn-primary ${styles.addToCartBtn}`}
          disabled={isOutOfStock}
        >
          {added ? <CheckCircle size={20} /> : <ShoppingBag size={20} />}
          {added ? 'Added to Cart' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button className={`btn btn-outline ${styles.wishlistBtn}`} aria-label="Add to Wishlist">
          <Heart size={20} />
        </button>
      </div>

      {/* Trust Badges under CTA */}
      <div className={styles.trustBadges}>
        <div className={styles.trustBadge}>
          <ShieldCheck size={16} color="#16a34a" />
          <span>Secure Checkout</span>
        </div>
        <div className={styles.trustBadge}>
          <ShieldCheck size={16} color="#16a34a" />
          <span>Guaranteed Authenticity</span>
        </div>
      </div>
    </div>
  );
};

export default ProductActions;
