import React from 'react';
import { Star } from 'lucide-react';
import styles from './PDP.module.css';

const ProductInfo = ({ product, reviewsCount = 124, rating = 4.8 }) => {
  return (
    <div className={styles.infoContainer}>
      <h1 className={styles.title}>{product?.name}</h1>
      <p className={styles.category}>{product?.category?.name || 'Jewelry'}</p>
      
      {/* Trust Signal: Ratings */}
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
