import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../../utils/api';
import styles from './PDP.module.css';

const ProductReviews = ({ product }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;
      try {
        const res = await api.get(`/reviews/products/${product.id}/reviews`);
        setReviews(res.data?.data?.reviews || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [product]);

  if (loading) return null;

  if (reviews.length === 0) {
    return (
      <div className={styles.reviewsSection}>
        <h3 className={styles.sectionTitle}>Customer Reviews</h3>
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
          <p style={{ marginBottom: '16px' }}>No reviews available for this product yet.</p>
          <button className={`btn btn-outline ${styles.writeReviewBtn}`}>Be the first to review</button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className={styles.reviewsSection}>
      <h3 className={styles.sectionTitle}>Customer Reviews</h3>
      
      <div className={styles.reviewsSummary}>
        <div className={styles.summaryStars}>
          <span className={styles.summaryRating}>{averageRating.toFixed(1)}</span>
          <div className={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} fill={star <= Math.round(averageRating) ? '#fbbf24' : 'transparent'} color="#fbbf24" />
            ))}
          </div>
          <span className={styles.summaryCount}>Based on {reviews.length} reviews</span>
        </div>
        <button className={`btn btn-outline ${styles.writeReviewBtn}`}>Write a Review</button>
      </div>

      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewAuthorInfo}>
                <div className={styles.reviewAvatar}>{(review.user?.name || 'A').charAt(0)}</div>
                <div>
                  <div className={styles.reviewAuthorName}>{review.user?.name || 'Anonymous'}</div>
                  <div className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} fill={star <= review.rating ? '#fbbf24' : 'transparent'} color={star <= review.rating ? '#fbbf24' : '#d1d5db'} />
                ))}
              </div>
            </div>
            <p className={styles.reviewText}>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
