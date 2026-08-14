import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../utils/api';

// PDP Components
import ProductGallery from '../../components/product/PDP/ProductGallery';
import ProductInfo from '../../components/product/PDP/ProductInfo';
import ProductPricing from '../../components/product/PDP/ProductPricing';
import ProductVariants from '../../components/product/PDP/ProductVariants';
import ProductActions from '../../components/product/PDP/ProductActions';
import PincodeChecker from '../../components/product/PDP/PincodeChecker';
import ProductAccordions from '../../components/product/PDP/ProductAccordions';
import StickyCartBar from '../../components/product/PDP/StickyCartBar';
import ProductReviews from '../../components/product/PDP/ProductReviews';
import RelatedProducts from '../../components/product/PDP/RelatedProducts';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore(state => state.addItem);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get('/products');
        const products = res.data.data.products;
        const found = products.find(p => p.slug === slug || p.id === slug);
        setProduct(found || null);
        
        if (found && isAuthenticated) {
          api.post(`/products/${found.id}/track-view`).catch(err => console.error('Failed to track view', err));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, isAuthenticated]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (product) {
      addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) return <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>Loading product details...</div>;
  
  if (!product) return (
    <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Shop</button>
    </div>
  );

  return (
    <>
      <div className="container" style={{ padding: '40px 20px', position: 'relative' }}>
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate('/shop')} 
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '32px', color: '#666', fontWeight: 500 }}
        >
          <ArrowLeft size={20} /> Back to Shop
        </button>

        <div className="mobile-stack" style={{ display: 'flex', gap: 'var(--spacing-xxl)' }}>
          
          {/* Left Column: Image Gallery */}
          <ProductGallery product={product} />

          {/* Right Column: Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            
            <ProductInfo product={product} />
            <ProductPricing product={product} />
            <ProductVariants product={product} />
            
            <ProductActions 
              product={product} 
              onAddToCart={handleAddToCart} 
              added={added} 
            />

            <PincodeChecker />
            <ProductAccordions product={product} />
            
          </div>
        </div>

        {/* Bottom Sections */}
        <ProductReviews product={product} />
        <RelatedProducts currentProduct={product} />
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <StickyCartBar 
        product={product} 
        onAddToCart={handleAddToCart} 
        added={added} 
      />
    </>
  );
};

export default ProductDetail;
