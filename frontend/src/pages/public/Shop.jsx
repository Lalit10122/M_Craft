import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';
import QuickViewModal from '../../components/product/QuickViewModal';
import SEO from '../../components/common/SEO';

const FilterAccordion = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', padding: '16px 0' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0, color: '#111' }}
      >
        {title}
        <span>{isOpen ? '-' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  const categorySlug = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
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
  }, [query, categorySlug, page]);

  const filterDesc = categorySlug ? `${categorySlug.replace('-', ' ')}` : query ? `results for "${query}"` : 'all collections';

  return (
    <div className="container" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      <SEO 
        title={categorySlug ? `${categorySlug.replace('-', ' ').toUpperCase()} | Shop` : query ? `Search: ${query}` : 'Shop All'} 
        description={`Explore our handcrafted jewelry. Browsing ${filterDesc}.`}
      />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 400 }}>
            {query ? `Search Results for "${query}"` : (categorySlug ? categories.find(c => c.slug === categorySlug)?.name || 'Collection' : 'The Collection')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Explore our handcrafted pieces designed for the modern wardrobe.</p>
        </div>
        
        {/* Mobile Filter Toggle */}
        <button 
          className="btn btn-outline show-mobile-flex" 
          style={{ display: 'none', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-xxl)' }}>
        {/* Desktop Sidebar Filters */}
        <aside style={{ width: '250px', flexShrink: 0 }} className="hide-mobile">
          <FilterAccordion title="Categories" defaultOpen={true}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: !categorySlug ? 'var(--color-primary)' : '#555' }} onClick={() => setSearchParams({})}>
              All Collections
            </label>
            {categories.filter(c => !c.parentId).map(parent => (
              <div key={parent.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#111' }}>{parent.name}</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '12px' }}>
                  {categories.filter(c => c.parentId === parent.id).map(child => (
                    <label key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: categorySlug === child.slug ? 'var(--color-primary)' : '#555' }} onClick={() => setSearchParams({ category: child.slug })}>
                      {child.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </FilterAccordion>

          {categoryAttributes.map(attr => (
            <FilterAccordion key={attr.id} title={attr.name} defaultOpen={false}>
              {attr.options?.split(',').map(opt => opt.trim()).filter(Boolean).map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} /> {opt}
                </label>
              ))}
            </FilterAccordion>
          ))}

          <FilterAccordion title="Price Range" defaultOpen={false}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}><input type="radio" name="price" style={{ accentColor: 'var(--color-primary)' }} /> Under ₹1000</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}><input type="radio" name="price" style={{ accentColor: 'var(--color-primary)' }} /> ₹1000 - ₹5000</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}><input type="radio" name="price" style={{ accentColor: 'var(--color-primary)' }} /> Over ₹5000</label>
          </FilterAccordion>
        </aside>

        {/* Product Grid Area */}
        <main style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-xl)' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: 'var(--spacing-xxl)', textAlign: 'center', background: 'white', borderRadius: '2px', border: '1px solid var(--color-border)' }}>
              <h3>No pieces found</h3>
              <p style={{ color: 'var(--color-text-muted)', margin: 'var(--spacing-md) 0' }}>
                We couldn't find any products matching your selection.
              </p>
              <button onClick={() => setSearchParams({})} className="btn btn-outline">Clear Filters</button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <RevealGrid key={query || categorySlug || 'all'} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-xl)' }}>
                  {products.map((product, index) => (
                    <RevealCard key={product.id} index={index}>
                      <ProductCard 
                        product={product} 
                        onQuickView={(p) => {
                          setQuickViewProduct(p);
                          setIsQuickViewOpen(true);
                        }}
                      />
                    </RevealCard>
                  ))}
                </RevealGrid>
              </AnimatePresence>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-3xl)' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setPage(p => p + 1)}
                    disabled={loadingMore}
                    style={{ padding: '14px 40px', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Bottom Sheet (Keep as is, but style matched) */}
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
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: 'var(--spacing-xl)', zIndex: 1001, maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400 }}>Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} style={{ color: '#111', background: 'none', border: 'none' }}><X size={24} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <FilterAccordion title="Categories" defaultOpen={true}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setSearchParams({}); setShowMobileFilters(false); }}>
                    All Collections
                  </label>
                  {categories.filter(c => !c.parentId).map(parent => (
                    <div key={parent.id} style={{ marginLeft: '8px', marginTop: '8px' }}>
                      <strong>{parent.name}</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', marginLeft: '8px' }}>
                        {categories.filter(c => c.parentId === parent.id).map(child => (
                          <label key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setSearchParams({ category: child.slug }); setShowMobileFilters(false); }}>
                            <input type="radio" checked={categorySlug === child.slug} readOnly style={{ accentColor: 'var(--color-primary)' }} /> {child.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </FilterAccordion>
                
                {categoryAttributes.map(attr => (
                  <FilterAccordion key={attr.id} title={attr.name} defaultOpen={false}>
                    {attr.options?.split(',').map(opt => opt.trim()).filter(Boolean).map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} /> {opt}
                      </label>
                    ))}
                  </FilterAccordion>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--spacing-xl)', padding: '16px' }} onClick={() => setShowMobileFilters(false)}>
                View Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        product={quickViewProduct} 
      />
    </div>
  );
};

export default Shop;
