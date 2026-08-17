import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';

const ProductCard = ({ product, square = false }) => {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false); // Can be lifted up later if needed
  const navigate = useNavigate();
  const location = useLocation();
  const addItem = useCartStore(state => state.addItem);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const shouldReduceMotion = useReducedMotion();

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  };

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
        
        {/* SALE Badge */}
        {product.activePromotion && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'var(--color-primary)',
            color: 'white',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 10
          }} title={product.activePromotion.name}>
            SALE
          </div>
        )}
        
        {/* Removed secondary image hover swap per Addendum */}
        
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

        {/* Quick Add Button Overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}
            >
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '10px', background: 'rgba(17, 17, 17, 0.9)', backdropFilter: 'blur(4px)' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: location } });
                    return;
                  }
                  addItem(product);
                }}
              >
                <ShoppingBag size={16} /> Quick Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <h4 style={{ margin: '8px 0', fontSize: '1rem', flex: 1, transition: 'color 0.2s ease' }}>{product.name}</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>₹{product.basePrice}</span>
        {product.mrp > product.basePrice && (
          <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>₹{product.mrp}</span>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
