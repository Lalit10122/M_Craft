import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';
import { AnimatePresence } from 'framer-motion';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [products, setProducts] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch all collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get('/collections');
        setCollections(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load collections.');
      } finally {
        setLoadingCollections(false);
      }
    };
    fetchCollections();
  }, []);

  // Fetch products whenever selected collection or page changes
  useEffect(() => {
    if (!selectedCollection) return;

    const fetchCollectionProducts = async () => {
      page === 1 ? setLoadingProducts(true) : setLoadingMore(true);
      try {
        const url = selectedCollection === 'ALL' 
          ? `/products?limit=12&page=${page}` 
          : `/collections/${selectedCollection.slug}?limit=12&page=${page}`;
        
        const res = await api.get(url);
        const fetchedProducts = res.data.data.products || [];
        
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
        if (page === 1) setProducts([]);
      } finally {
        setLoadingProducts(false);
        setLoadingMore(false);
      }
    };
    fetchCollectionProducts();
  }, [selectedCollection, page]);

  // Reset page when collection changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
  }, [selectedCollection]);

  if (loadingCollections) {
    return (
      <div className="container" style={{ padding: '24px 16px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '24px', textAlign: 'center', fontWeight: 700, color: 'transparent', background: '#e0e0e0', width: '250px', margin: '0 auto 24px', borderRadius: '4px' }}>
          Loading
        </h1>
        
        {/* Fake tabs */}
        <div style={styles.tabsContainer}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ width: '120px', height: '42px', background: '#e0e0e0', borderRadius: '30px' }} />
          ))}
        </div>

        {/* Fake grid */}
        <div className="responsive-grid" style={{ marginTop: '24px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center', color: 'red' }}>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '24px', textAlign: 'center', fontWeight: 700 }}>
        Our Collections
      </h1>

      {/* Collection Navigation Tabs */}
      {collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No collections available.
        </div>
      ) : (
        <>
          <div style={styles.tabsContainer}>
            {/* "All Products" Tab */}
            <button
              onClick={() => setSelectedCollection('ALL')}
              style={{
                ...styles.tabButton,
                backgroundColor: selectedCollection === 'ALL' ? 'var(--color-primary, #111)' : 'transparent',
                color: selectedCollection === 'ALL' ? '#fff' : 'var(--color-text, #333)',
                borderColor: selectedCollection === 'ALL' ? 'var(--color-primary, #111)' : '#ddd',
              }}
            >
              All Products
            </button>

            {collections.map((col) => {
              const isSelected = selectedCollection?.id === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollection(col)}
                  style={{
                    ...styles.tabButton,
                    backgroundColor: isSelected ? 'var(--color-primary, #111)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--color-text, #333)',
                    borderColor: isSelected ? 'var(--color-primary, #111)' : '#ddd',
                  }}
                >
                  {col.name} ({col._count?.products ?? 0})
                </button>
              );
            })}
          </div>

          {/* Description of current collection */}
          {selectedCollection && selectedCollection !== 'ALL' && selectedCollection.description && (
            <div style={styles.descriptionBox}>
              <p style={{ margin: 0, color: '#555', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {selectedCollection.description}
              </p>
            </div>
          )}

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="responsive-grid" style={{ marginTop: '24px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={styles.emptyBox}>
              <h3 style={{ margin: '0 0 8px 0' }}>No Products Found</h3>
              <p style={{ margin: 0, color: '#888' }}>
                There are currently no products in {selectedCollection === 'ALL' ? 'our catalog' : `the ${selectedCollection?.name} collection`}.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <RevealGrid key={selectedCollection === 'ALL' ? 'all' : selectedCollection?.id || 'empty'} className="responsive-grid" style={{ marginTop: '24px' }}>
                {products.map((product, index) => (
                  <RevealCard key={product.id} index={index}>
                    <ProductCard product={product} />
                  </RevealCard>
                ))}
              </RevealGrid>
            </AnimatePresence>
          )}

          {/* Load More Button */}
          {hasMore && products.length > 0 && !loadingProducts && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button 
                onClick={() => setPage(p => p + 1)} 
                className="btn btn-outline" 
                disabled={loadingMore}
                style={{ padding: '12px 32px', minWidth: '200px' }}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  tabsContainer: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '16px',
    marginBottom: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tabButton: {
    padding: '10px 20px',
    fontSize: '0.95rem',
    fontWeight: 600,
    borderRadius: '30px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    whiteSpace: 'nowrap',
  },
  descriptionBox: {
    background: '#f9f9f9',
    padding: '16px 20px',
    borderRadius: '8px',
    borderLeft: '4px solid var(--color-primary, #111)',
    marginBottom: '32px',
    maxWidth: '800px',
    margin: '0 auto 32px auto',
  },
  emptyBox: {
    padding: '48px',
    textAlign: 'center',
    background: '#fafafa',
    borderRadius: '12px',
    border: '1px dashed #ddd',
    marginTop: '24px',
  },
};

export default Collections;
