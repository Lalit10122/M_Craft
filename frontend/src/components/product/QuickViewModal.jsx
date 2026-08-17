import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import useWishlistStore from '../../store/useWishlistStore';
import { useToast } from '../common/ToastContext';

const QuickViewModal = ({ isOpen, onClose, product }) => {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { toggleItem, hasItem } = useWishlistStore();
  const { addToast } = useToast();
  
  if (!product) return null;

  const wishlisted = hasItem(product.id);
  const isOutOfStock = product.stockQty === 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      onClose();
      return;
    }
    addItem(product);
    addToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart.`,
      action: { label: 'View Cart', onClick: () => useCartStore.getState().openCart() }
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000 }}
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ 
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
              background: 'white', zIndex: 10001, borderRadius: '8px', width: '90vw', maxWidth: '900px', 
              maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' 
            }}
          >
            <button 
              onClick={onClose} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', height: '100%' }}>
              {/* Image Section */}
              <div style={{ flex: '1 1 400px', minHeight: '300px', background: '#f9f9f9' }}>
                <img src={product.firstImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Details Section */}
              <div style={{ flex: '1 1 400px', padding: 'var(--spacing-2xl)', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 500 }}>{product.name}</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', color: '#fbbf24' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < (product.rating || 5) ? '#fbbf24' : 'transparent'} />
                    ))}
                  </div>
                  <a href={`/product/${product.slug}#reviews`} style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'underline' }}>Read {product.reviewCount || 0} Reviews</a>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>₹{product.basePrice}</span>
                  {product.mrp && product.mrp > product.basePrice && (
                    <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>₹{product.mrp}</span>
                  )}
                </div>

                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
                  {product.description?.substring(0, 150)}{product.description?.length > 150 ? '...' : ''}
                </p>

                <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.05rem' }}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    <ShoppingBag size={20} />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    onClick={() => toggleItem(product)}
                  >
                    <Heart size={24} fill={wishlisted ? '#dc2626' : 'transparent'} color={wishlisted ? '#dc2626' : '#111'} />
                  </button>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button 
                    onClick={() => { onClose(); navigate(`/product/${product.slug || product.id}`); }}
                    style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
