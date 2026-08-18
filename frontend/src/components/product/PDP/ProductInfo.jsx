import React from 'react';
import { Star, Award, Tag } from 'lucide-react';
import styles from './PDP.module.css';

const ProductInfo = ({ product, reviewsCount = 124, rating = 4.8 }) => {
  const isDiscounted = product?.mrp > product?.basePrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)
    : 0;
  const isBestSeller = product?.isBestSeller;
  const stockQty = product?.stockQty ?? 0;

  return (
    <div className={styles.infoContainer}>
      {/* Badges row */}
      <div className={styles.badgeRow}>
        {isBestSeller && (
          <span className={styles.bestsellerBadge}>
            <Award size={14} /> Bestseller
          </span>
        )}
        {isDiscounted && (
          <span className={styles.discountPill}>
            <Tag size={14} /> {discountPercent}% OFF
          </span>
        )}
      </div>

      <h1 className={styles.title}>{product?.name}</h1>

      {/* Social proof line */}
      <p className={styles.socialProof}>
        {product?.category?.name || 'Jewelry'}
        {stockQty > 0 && <span> · Free Shipping on Prepaid</span>}
      </p>

      {/* Ratings */}
      <div className={styles.ratingsWrapper}>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              fill={star <= Math.round(rating) ? '#fbbf24' : 'transparent'}
              color={star <= Math.round(rating) ? '#fbbf24' : '#d1d5db'}
            />
          ))}
        </div>
        <span className={styles.reviewCount}>
          {rating} ({reviewsCount} reviews)
        </span>
      </div>
    </div>
  );
};

export default ProductInfo;
