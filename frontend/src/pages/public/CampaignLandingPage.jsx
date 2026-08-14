import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../../components/product/ProductCard';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';
import api from '../../utils/api';

const CampaignLandingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [promotion, setPromotion] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch promotion details
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await api.get('/promotions/active');
        const activePromos = res.data?.data || [];
        const match = activePromos.find(p => p.id === id);
        if (match) {
          setPromotion(match);
        }
      } catch (err) {
        console.error('Failed to fetch promotion details', err);
      }
    };
    fetchPromo();
  }, [id]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      try {
        const url = `http://localhost:5000/api/products?promotionId=${id}&page=${page}`;
        const res = await axios.get(url);
        const fetchedProducts = res.data.data.products;
        
        if (page === 1) {
          setProducts(fetchedProducts);
        } else {
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = fetchedProducts.filter(p => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
        }
        
        setHasMore(fetchedProducts.length >= 12);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchProducts();
  }, [id, page]);

  return (
    <div className="container">
      {promotion && (
        <div style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center', background: 'var(--color-surface)', padding: 'var(--spacing-xl)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <h1 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-primary)' }}>{promotion.name}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', margin: 0 }}>
            {promotion.type === 'PERCENTAGE_OFF' && `${promotion.value}% OFF`}
            {promotion.type === 'FLAT_OFF' && `₹${promotion.value} OFF`}
            {promotion.type === 'BUY_X_GET_Y' && `Buy ${promotion.buyQty} Get ${promotion.getQty} Free!`}
          </p>
        </div>
      )}

      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xxl)' }}>Loading campaign...</div>
      ) : products.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xxl)', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3>No products found for this campaign.</h3>
          <button onClick={() => navigate('/shop')} className="btn btn-outline" style={{ marginTop: 'var(--spacing-md)' }}>View All Products</button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <RevealGrid key={id} className="responsive-grid">
              {products.map((product, index) => (
                <RevealCard key={product.id} index={index}>
                  <ProductCard product={product} />
                </RevealCard>
              ))}
            </RevealGrid>
          </AnimatePresence>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setPage(p => p + 1)}
                disabled={loadingMore}
                style={{ padding: '12px 32px' }}
              >
                {loadingMore ? 'Loading...' : 'Load More Products'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CampaignLandingPage;
