import React from 'react';
import { ShoppingBag, Heart, CheckCircle, ShieldCheck, Truck, RotateCcw, Ticket } from 'lucide-react';
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

      {/* Trust info list (vertical, like the reference) */}
      <div className={styles.trustList}>
        <div className={styles.trustItem}>
          <RotateCcw size={18} color="#555" />
          <span>7 Day Easy Returns & Exchanges</span>
        </div>
        <div className={styles.trustItem}>
          <Ticket size={18} color="#555" />
          <span>Use code <strong>FIRST10</strong> for 10% off your first order</span>
        </div>
        <div className={styles.trustItem}>
          <Truck size={18} color="#555" />
          <span>Free shipping on all prepaid orders</span>
        </div>
        <div className={styles.trustItem}>
          <ShieldCheck size={18} color="#555" />
          <span>100% Authentic & Hypoallergenic</span>
        </div>
      </div>
    </div>
  );
};

export default ProductActions;
