import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, SlidersHorizontal, X } from 'lucide-react';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const categorySlug = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Reset pagination when search query or category changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
  }, [query, categorySlug]);

  // Fetch Categories for the filter sidebar
  useEffect(() => {
    api.get('/categories')
       .then(res => setCategories(res.data?.data || []))
       .catch(err => console.error(err));
  }, []);

  // Fetch dynamic attributes when a category is selected
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const selectedCat = categories.find(c => c.slug === categorySlug);
      if (selectedCat) {
        api.get(`/categories/${selectedCat.id}/attributes`)
           .then(res => setCategoryAttributes(res.data?.data || []))
           .catch(err => console.error(err));
      } else {
        setCategoryAttributes([]);
      }
    } else {
      setCategoryAttributes([]);
    }
  }, [categorySlug, categories]);

  useEffect(() => {
    const fetchProducts = async () => {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      try {
        let url = `/products?page=${page}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;
        if (categorySlug) url += `&category=${encodeURIComponent(categorySlug)}`;
        
        const res = await api.get(url);
        const fetchedProducts = res.data.data.products;
        
        if (page === 1) {
          setProducts(fetchedProducts);
        } else {
          setProducts(prev => {
            // Prevent duplicates just in case React Strict Mode fires twice
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = fetchedProducts.filter(p => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
        }
        
        setHasMore(fetchedProducts.length >= 12); // Default limit is 12
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchProducts();
  }, [query, page]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h1 style={{ margin: 0 }}>
          {query ? `Search Results for "${query}"` : (categorySlug ? categories.find(c => c.slug === categorySlug)?.name || 'Shop' : 'Shop Collection')}
        </h1>
        
        {/* Mobile Filter Button */}
        <button 
          className="btn btn-outline show-mobile-flex" 
          style={{ display: 'none', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xxl)' }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xxl)', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3>No results found for "{query}"</h3>
          <p style={{ color: 'var(--color-text-muted)', margin: 'var(--spacing-md) 0' }}>
            Try a different search or browse our popular collections.
          </p>
          <a href="/shop" className="btn btn-outline">View All Products</a>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <RevealGrid key={query || 'all'} className="responsive-grid">
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

      {/* Mobile Filters Bottom Sheet */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: 'var(--spacing-xl)', zIndex: 1001, maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ margin: 0 }}>Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} style={{ color: 'var(--color-text-muted)' }}><X size={24} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ marginBottom: '8px' }}>Categories</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: !categorySlug ? 'bold' : 'normal', cursor: 'pointer' }} onClick={() => { setSearchParams({}); setShowMobileFilters(false); }}>
                      All Products
                    </label>
                    {categories.filter(c => !c.parentId).map(parent => (
                      <div key={parent.id} style={{ marginLeft: '8px', marginTop: '8px' }}>
                        <strong>{parent.name}</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', marginLeft: '8px' }}>
                          {categories.filter(c => c.parentId === parent.id).map(child => (
                            <label key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setSearchParams({ category: child.slug }); setShowMobileFilters(false); }}>
                              <input type="radio" checked={categorySlug === child.slug} readOnly /> {child.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {categoryAttributes.map(attr => (
                  <div key={attr.id} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <h4 style={{ marginBottom: '8px' }}>{attr.name}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {attr.options?.split(',').map(opt => opt.trim()).filter(Boolean).map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Price</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" name="price" /> Under ₹1000</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" name="price" /> ₹1000 - ₹5000</label>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--spacing-xl)' }} onClick={() => setShowMobileFilters(false)}>
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
