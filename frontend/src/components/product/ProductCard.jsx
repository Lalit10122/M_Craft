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

  const activeBadges = [];
  if (isLowStock) activeBadges.push({ label: 'LOW STOCK', bg: 'var(--color-error)', color: 'white' });
  if (isSale && activeBadges.length < 2) activeBadges.push({ label: 'SALE', bg: 'var(--color-secondary)', color: 'white' });
  if (isNew && activeBadges.length < 2) activeBadges.push({ label: 'NEW', bg: 'var(--color-primary)', color: 'white' });

  // Branded fallback placeholder
  const placeholderImg = 'https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=400&auto=format&fit=crop';

  return (
    <motion.div 
      className="product-card" 
      style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', position: 'relative', height: '100%' }}
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
          src={product.firstImage || placeholderImg} 
          onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
          alt={product.name || 'Aurelia Jewelry'} 
          className="product-image"
          style={{ height: square ? 'auto' : '300px', aspectRatio: square ? '1/1' : 'auto', objectFit: 'cover', width: '100%', background: '#fafafa' }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          loading="lazy"
        />
        
        {/* Dynamic Badges (Max 2) */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10 }}>
          {activeBadges.map((badge, idx) => (
            <div key={idx} style={{ background: badge.bg, color: badge.color, padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px' }}>
              {badge.label}
            </div>
          ))}
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
            color: wishlisted ? 'var(--color-error)' : 'var(--color-primary)'
          }}
        >
          <motion.div
            initial={false}
            animate={{ scale: wishlisted ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart size={18} fill={wishlisted ? 'var(--color-error)' : 'transparent'} />
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
                  style={{ flex: 1, padding: '10px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid var(--color-border)' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                >
                  <Eye size={16} color="var(--color-primary)" />
                </button>
              )}
              <button 
                className="btn btn-primary" 
                style={{ flex: 3, padding: '10px', background: 'var(--color-primary)', border: 'none' }}
                onClick={handleQuickAdd}
              >
                <ShoppingBag size={16} /> Quick Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Product Info */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 4px' }}>
        <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--color-text-main)' }}>{product.name}</h4>
        
        {/* Ratings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          {(!product.reviewCount || product.reviewCount === 0) ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No reviews yet</span>
          ) : (
            <>
              <div style={{ display: 'flex', color: 'var(--color-accent)' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < (product.rating || 5) ? 'var(--color-accent)' : 'transparent'} />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>({product.reviewCount})</span>
            </>
          )}
        </div>

        {/* Pricing */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontWeight: 500, fontSize: '1.1rem', color: 'var(--color-text-main)' }}>₹{product.basePrice}</span>
          {product.mrp && product.mrp > product.basePrice && (
            <>
              <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>₹{product.mrp}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                {Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
