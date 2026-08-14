import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import RevealGrid from '../common/RevealGrid';
import RevealCard from '../common/RevealCard';
import ProductCard from './ProductCard';

const RecentlyViewedStrip = () => {
  const [products, setProducts] = useState([]);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/products/recently-viewed')
         .then(res => setProducts(res.data.data || []))
         .catch(err => console.error('Failed to fetch recently viewed:', err));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || products.length === 0) return null;

  return (
    <div className="container" style={{ padding: '60px 20px', borderTop: '1px solid var(--color-border)' }}>
      <h3 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>Recently Viewed</h3>
      <RevealGrid>
        {products.map((product, index) => (
          <RevealCard key={product.id} index={index}>
            <ProductCard product={product} />
          </RevealCard>
        ))}
      </RevealGrid>
    </div>
  );
};

export default RecentlyViewedStrip;
