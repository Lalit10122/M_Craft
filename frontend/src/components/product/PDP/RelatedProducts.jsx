import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../ProductCard';
import styles from './PDP.module.css';

const RelatedProducts = ({ currentProduct }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        const allProducts = res.data.data.products || [];
        
        const categoryId = currentProduct?.categoryId;
        let filtered = allProducts.filter(p => p.id !== currentProduct?.id);
        
        if (categoryId) {
          const sameCategory = filtered.filter(p => p.categoryId === categoryId);
          if (sameCategory.length >= 4) {
            filtered = sameCategory;
          }
        }
        
        // Take up to 6 items to make scrolling worthwhile
        setRelatedProducts(filtered.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentProduct) {
      fetchRelated();
    }
  }, [currentProduct]);

  if (loading || relatedProducts.length === 0) return null;

  return (
    <div className={styles.relatedSection}>
      <h3 className={styles.sectionTitle}>You May Also Like</h3>
      <div className={`no-scrollbar ${styles.relatedScrollContainer}`}>
        {relatedProducts.map(product => (
          <div key={product.id} className={styles.relatedCardWrapper}>
            <ProductCard product={product} square={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
