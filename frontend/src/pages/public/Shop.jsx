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
  const collectionSlug = searchParams.get('collection');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Reset pagination when search query, category, collection, or sort changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
  }, [query, categorySlug, collectionSlug, searchParams.get('sort')]);

  // Fetch Categories for the filter sidebar
  useEffect(() => {
    api.get('/categories')
       .then(res => setCategories(res.data?.data || []))
       .catch(err => console.error(err));
       
    api.get('/collections')
       .then(res => setCollections(res.data?.data || []))
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
        let url = `/products?page=${page}&limit=12`;
        
        // Pass all searchParams down to API for filters to work
        searchParams.forEach((value, key) => {
            if (key !== 'page' && key !== 'limit') {
                url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }
        });
        
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
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchProducts();
  }, [searchParams, page]);

  const filterDesc = collectionSlug ? `${collectionSlug.replace('-', ' ')}` : categorySlug ? `${categorySlug.replace('-', ' ')}` : query ? `results for "${query}"` : 'all products';

  return (
    <div className="container" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
      <SEO 
        title={categorySlug ? `${categorySlug.replace('-', ' ').toUpperCase()} | Shop` : query ? `Search: ${query}` : 'Shop All'} 
        description={`Explore our handcrafted jewelry. Browsing ${filterDesc}.`}
      />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' }}>
        <div>
          {/* Breadcrumbs */}
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s ease' }} onClick={() => navigate('/')} onMouseEnter={(e) => e.target.style.color = '#111'} onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}>Home</span>
            <span>/</span>
            <span style={{ cursor: 'pointer', color: !categorySlug && !collectionSlug && !query ? '#111' : 'var(--color-text-muted)', transition: 'color 0.2s ease' }} onClick={() => setSearchParams({})} onMouseEnter={(e) => e.target.style.color = '#111'} onMouseLeave={(e) => e.target.style.color = !categorySlug && !collectionSlug && !query ? '#111' : 'var(--color-text-muted)'}>Shop</span>
            {(categorySlug || collectionSlug || query) && (
              <>
                <span>/</span>
                <span style={{ color: '#111' }}>
                  {query ? 'Search Results' : collectionSlug ? collections.find(c => c.slug === collectionSlug)?.name || 'Collection' : categories.find(c => c.slug === categorySlug)?.name || 'Category'}
                </span>
              </>
            )}
          </div>
          
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 400 }}>
            {query ? `Search Results for "${query}"` : (collectionSlug ? collections.find(c => c.slug === collectionSlug)?.name || 'Collection' : categorySlug ? categories.find(c => c.slug === categorySlug)?.name || 'Category' : 'All Products')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Explore our handcrafted pieces designed for the modern wardrobe.</p>
        </div>
        
        {/* Sort and Mobile Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="hide-mobile">
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
            <select 
              className="select-input" 
              style={{ padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'transparent', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', outline: 'none' }}
              value={searchParams.get('sort') || 'featured'}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('sort', e.target.value);
                setSearchParams(newParams);
              }}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="newest">Sort by: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Best Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
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
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-xxl)' }}>
        {/* Desktop Sidebar Filters */}
        <aside style={{ width: '250px', flexShrink: 0 }} className="hide-mobile">
          <FilterAccordion title="Categories" defaultOpen={true}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: (!categorySlug && !collectionSlug) ? 'var(--color-primary)' : '#555' }} onClick={() => setSearchParams({})}>
              All Products
            </label>
            {categories.map(cat => {
              // If we have a nested category structure, only process root items here. If it's a flat list, this naturally processes all.
              if (cat.parentId) return null; 
              
              const children = categories.filter(c => c.parentId === cat.id);
              
              if (children.length === 0) {
                 return (
                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px', color: categorySlug === cat.slug ? 'var(--color-primary)' : '#111', fontWeight: 500 }} onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('collection');
                        newParams.set('category', cat.slug);
                        setSearchParams(newParams);
                    }}>
                      {cat.name}
                    </label>
                 );
              }
              
              return (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#111' }}>{cat.name}</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '12px' }}>
                    {children.map(child => (
                      <label key={child.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: categorySlug === child.slug ? 'var(--color-primary)' : '#555' }} onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.delete('collection');
                          newParams.set('category', child.slug);
                          setSearchParams(newParams);
                      }}>
                        {child.name}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </FilterAccordion>

          <FilterAccordion title="Collections" defaultOpen={true}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {collections.map(col => (
                <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: collectionSlug === col.slug ? 'var(--color-primary)' : '#555' }} onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    newParams.set('collection', col.slug);
                    setSearchParams(newParams);
                }}>
                  {col.name}
                </label>
              ))}
            </div>
          </FilterAccordion>

          {categoryAttributes.map(attr => {
            const filterKey = attr.name.toLowerCase();
            return (
              <FilterAccordion key={attr.id} title={attr.name} defaultOpen={false}>
                {attr.options?.split(',').map(opt => opt.trim()).filter(Boolean).map(opt => {
                  const isChecked = searchParams.getAll(filterKey).includes(opt);
                  return (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        style={{ accentColor: 'var(--color-primary)' }} 
                        checked={isChecked}
                        onChange={(e) => {
                          const newParams = new URLSearchParams(searchParams);
                          if (e.target.checked) {
                            newParams.append(filterKey, opt);
                          } else {
                            const current = newParams.getAll(filterKey);
                            newParams.delete(filterKey);
                            current.filter(val => val !== opt).forEach(val => newParams.append(filterKey, val));
                          }
                          setSearchParams(newParams);
                        }}
                      /> {opt}
                    </label>
                  );
                })}
              </FilterAccordion>
            );
          })}

          <FilterAccordion title="Price Range" defaultOpen={false}>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="price" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('maxPrice') === '1000'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if ('1000' === '1000') { newParams.delete('minPrice'); newParams.set('maxPrice', '1000'); }
                  else if ('1000' === '1000,5000') { newParams.set('minPrice', '1000'); newParams.set('maxPrice', '5000'); }
                  else { newParams.delete('maxPrice'); newParams.set('minPrice', '5000'); }
                  setSearchParams(newParams);
                }} /> Under ₹1000
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="price" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('minPrice') === '1000' && searchParams.get('maxPrice') === '5000'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if ('1000,5000' === '1000') { newParams.delete('minPrice'); newParams.set('maxPrice', '1000'); }
                  else if ('1000,5000' === '1000,5000') { newParams.set('minPrice', '1000'); newParams.set('maxPrice', '5000'); }
                  else { newParams.delete('maxPrice'); newParams.set('minPrice', '5000'); }
                  setSearchParams(newParams);
                }} /> ₹1000 - ₹5000
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="price" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('minPrice') === '5000'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if ('5000' === '1000') { newParams.delete('minPrice'); newParams.set('maxPrice', '1000'); }
                  else if ('5000' === '1000,5000') { newParams.set('minPrice', '1000'); newParams.set('maxPrice', '5000'); }
                  else { newParams.delete('maxPrice'); newParams.set('minPrice', '5000'); }
                  setSearchParams(newParams);
                }} /> Over ₹5000
              </label>
</FilterAccordion>

            
                <FilterAccordion title="Availability" defaultOpen={false}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('inStock') === 'true'} onChange={(e) => {
                      const newParams = new URLSearchParams(searchParams);
                      if (e.target.checked) newParams.set('inStock', 'true');
                      else newParams.delete('inStock');
                      setSearchParams(newParams);
                    }} /> In Stock
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('inStock') === 'false'} onChange={(e) => {
                      const newParams = new URLSearchParams(searchParams);
                      if (e.target.checked) newParams.set('inStock', 'false');
                      else newParams.delete('inStock');
                      setSearchParams(newParams);
                    }} /> Out of Stock
                  </label>
                </FilterAccordion>

<FilterAccordion title="Price Range" defaultOpen={false}>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_price" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('maxPrice') === '1000'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if ('1000' === '1000') { newParams.delete('minPrice'); newParams.set('maxPrice', '1000'); }
                  else if ('1000' === '1000,5000') { newParams.set('minPrice', '1000'); newParams.set('maxPrice', '5000'); }
                  else { newParams.delete('maxPrice'); newParams.set('minPrice', '5000'); }
                  setSearchParams(newParams);
                }} /> Under ₹1000
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_price" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('minPrice') === '1000' && searchParams.get('maxPrice') === '5000'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if ('1000,5000' === '1000') { newParams.delete('minPrice'); newParams.set('maxPrice', '1000'); }
                  else if ('1000,5000' === '1000,5000') { newParams.set('minPrice', '1000'); newParams.set('maxPrice', '5000'); }
                  else { newParams.delete('maxPrice'); newParams.set('minPrice', '5000'); }
                  setSearchParams(newParams);
                }} /> ₹1000 - ₹5000
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_price" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('minPrice') === '5000'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if ('5000' === '1000') { newParams.delete('minPrice'); newParams.set('maxPrice', '1000'); }
                  else if ('5000' === '1000,5000') { newParams.set('minPrice', '1000'); newParams.set('maxPrice', '5000'); }
                  else { newParams.delete('maxPrice'); newParams.set('minPrice', '5000'); }
                  setSearchParams(newParams);
                }} /> Over ₹5000
              </label>
</FilterAccordion>
<FilterAccordion title="Rating" defaultOpen={false}>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_rating" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('rating') === '4'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('rating', '4');
                  setSearchParams(newParams);
                }} /> 4+ Stars
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_rating" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('rating') === '3'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('rating', '3');
                  setSearchParams(newParams);
                }} /> 3+ Stars
              </label>
</FilterAccordion>
<FilterAccordion title="Discount" defaultOpen={false}>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_discount" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('discount') === '50'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('discount', '50');
                  setSearchParams(newParams);
                }} /> 50% or more
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_discount" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('discount') === '30'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('discount', '30');
                  setSearchParams(newParams);
                }} /> 30% or more
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_discount" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('discount') === '20'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('discount', '20');
                  setSearchParams(newParams);
                }} /> 20% or more
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', cursor: 'pointer' }}>
                <input type="radio" name="mobile_discount" style={{ accentColor: 'var(--color-primary)' }} checked={searchParams.get('discount') === '10'} onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('discount', '10');
                  setSearchParams(newParams);
                }} /> 10% or more
              </label>
</FilterAccordion>
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
