import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';
import { AnimatePresence } from 'framer-motion';
import RevealGrid from '../../components/common/RevealGrid';
import RevealCard from '../../components/common/RevealCard';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [products, setProducts] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');

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

  // Fetch products whenever selected collection changes
  useEffect(() => {
    if (!selectedCollection) return;

    const fetchCollectionProducts = async () => {
      setLoadingProducts(true);
      try {
        const url = selectedCollection === 'ALL' 
          ? '/products?limit=24' 
          : `/collections/${selectedCollection.slug}`;
        
        const res = await api.get(url);
        // /products returns { data: { products: [...] } }
        // /collections/:slug returns { data: { products: [...] } }
        setProducts(res.data.data.products || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCollectionProducts();
  }, [selectedCollection]);

  if (loadingCollections) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div>Loading collections...</div>
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
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#666' }}>
              Loading products in {selectedCollection === 'ALL' ? 'All Products' : selectedCollection?.name}...
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
