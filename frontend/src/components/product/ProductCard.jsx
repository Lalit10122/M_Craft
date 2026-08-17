import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Heart, Star, Eye } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import useWishlistStore from '../../store/useWishlistStore';
import { useToast } from '../common/ToastContext';

const ProductCard = ({ product, square = false, onQuickView }) => {
  const [hovered, setHovered] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const addItem = useCartStore(state => state.addItem);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  const { toggleItem, hasItem } = useWishlistStore();
  const wishlisted = hasItem(product.id);
  
  const { addToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    addItem(product);
    addToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart.`,
      action: { label: 'View Cart', onClick: (nav) => useCartStore.getState().openCart() }
    });
  };

  const isNew = new Date() - new Date(product.createdAt || Date.now()) < 30 * 24 * 60 * 60 * 1000;
  const isLowStock = product.stockQty > 0 && product.stockQty <= 5;
  const isSale = product.activePromotion || (product.mrp && product.mrp > product.basePrice);

  return (
    <motion.div 
      className="glass-panel" 
      style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        borderColor: 'var(--color-secondary)'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.slug || product.id}`)}
    >
      <motion.div className="hover-target" style={{ overflow: 'hidden', borderRadius: '4px', marginBottom: 'var(--spacing-sm)', position: 'relative' }}>
        <motion.img 
          src={product.firstImage} 
          alt={product.name} 
          className="product-image"
          style={{ height: square ? 'auto' : '300px', aspectRatio: square ? '1/1' : 'auto', objectFit: 'cover', width: '100%' }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          loading="lazy"
        />
        
        {/* Dynamic Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10 }}>
          {isSale && (
            <div style={{ background: 'var(--color-primary)', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px' }}>
              SALE
            </div>
          )}
          {isNew && (
            <div style={{ background: '#111', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px' }}>
              NEW
            </div>
          )}
          {isLowStock && (
            <div style={{ background: '#dc2626', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px' }}>
              LOW STOCK
            </div>
          )}
        </div>
        
        {/* Wishlist Button Overlay */}
        <motion.button
          onClick={toggleWishlist}
          whileTap={shouldReduceMotion ? {} : { scale: 0.8 }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: wishlisted ? '#dc2626' : '#111'
          }}
        >
          <motion.div
            initial={false}
            animate={{ scale: wishlisted ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart size={18} fill={wishlisted ? '#dc2626' : 'transparent'} />
          </motion.div>
        </motion.button>

        {/* Quick Actions Overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', gap: '8px' }}
            >
              {onQuickView && (
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '10px', background: 'rgba(255, 255, 255, 0.95)', border: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                >
                  <Eye size={16} />
                </button>
              )}
              <button 
                className="btn btn-primary" 
                style={{ flex: 3, padding: '10px', background: 'rgba(17, 17, 17, 0.95)', border: 'none' }}
                onClick={handleQuickAdd}
              >
                <ShoppingBag size={16} /> Quick Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Product Info */}
      <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.95rem', flex: 1, transition: 'color 0.2s ease', fontWeight: 500 }}>{product.name}</h4>
      
      {/* Ratings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', color: '#fbbf24' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill={i < (product.rating || 5) ? '#fbbf24' : 'transparent'} />
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#888' }}>({product.reviewCount || 0})</span>
      </div>

      {/* Pricing */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>₹{product.basePrice}</span>
        {product.mrp && product.mrp > product.basePrice && (
          <>
            <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>₹{product.mrp}</span>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
              {Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)}% OFF
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
