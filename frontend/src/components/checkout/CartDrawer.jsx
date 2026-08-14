import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import api from '../../utils/api';

const FREE_SHIPPING_THRESHOLD = 999;

const CartDrawer = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const navigate = useNavigate();
  const [activePromotions, setActivePromotions] = useState([]);
  
  useEffect(() => {
    if (isOpen) {
      api.get('/promotions/active')
         .then(res => setActivePromotions(res.data?.data || []))
         .catch(err => console.error(err));
    }
  }, [isOpen]);

  const calculateBuyXGetY = () => {
    let discount = 0;
    const bxgPromos = activePromotions.filter(p => p.type === 'BUY_X_GET_Y');
    
    bxgPromos.forEach(promo => {
      let eligibleItems = [];
      items.forEach(item => {
        const matchesScope = 
          promo.scope === 'ALL' ||
          (promo.scope === 'CATEGORY' && item.category?.id === promo.categoryId) ||
          (promo.scope === 'SPECIFIC_PRODUCTS' && promo.products?.some(p => p.id === item.id));
        
        if (matchesScope) {
          for (let i = 0; i < item.quantity; i++) {
            eligibleItems.push(item);
          }
        }
      });

      if (eligibleItems.length > 0) {
        eligibleItems.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
        const totalRequired = promo.buyQty + promo.getQty;
        const bundleCount = Math.floor(eligibleItems.length / totalRequired);
        if (bundleCount > 0) {
          const freeItemsCount = bundleCount * promo.getQty;
          for (let i = 0; i < freeItemsCount; i++) {
            discount += (eligibleItems[i].basePrice || 0);
          }
        }
      }
    });
    return discount;
  };

  const buyXGetYDiscount = calculateBuyXGetY();
  const total = Math.max(0, getCartTotal() - buyXGetYDiscount);
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progressPercent = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.overlay}
            onClick={closeCart}
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="cart-drawer"
            style={styles.drawer}
          >
            <div style={styles.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} />
                <h3 style={{ margin: 0 }}>Your Cart</h3>
              </div>
              <button onClick={closeCart} style={styles.closeBtn}><X size={24} /></button>
            </div>

            {/* Progressive Shipping Bar */}
            <div style={styles.shippingBarContainer}>
              <p style={styles.shippingText}>
                {amountForFreeShipping > 0 
                  ? <>Add <strong>₹{amountForFreeShipping}</strong> more for free shipping!</>
                  : <strong style={{ color: 'var(--color-success)' }}>You've unlocked Free Shipping!</strong>
                }
              </p>
              <div style={styles.progressBarWrapper}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ ...styles.progressBar, background: amountForFreeShipping === 0 ? 'var(--color-success)' : 'var(--color-primary)' }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div style={styles.itemsContainer}>
              {items.length === 0 ? (
                <div style={styles.emptyCart}>
                  <ShoppingBag size={48} color="#ddd" />
                  <p>Your cart is empty.</p>
                  <button className="btn btn-outline" onClick={closeCart} style={{ marginTop: 'var(--spacing-md)' }}>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div 
                      key={item.id} 
                      style={styles.cartItem}
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 'var(--spacing-md)' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.3 }}
                    >
                      <img src={item.firstImage} alt={item.name} style={styles.itemImage} />
                      <div style={styles.itemDetails}>
                        <div style={styles.itemHeader}>
                          <h4 style={styles.itemName}>
                            {item.name}
                            {item.isBoxBuilder && <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>BOX</span>}
                          </h4>
                          <button onClick={() => removeItem(item.id)} style={styles.removeBtn}><X size={16} /></button>
                        </div>
                        {item.description && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{item.description}</div>}
                        <div style={styles.itemPrice}>₹{item.basePrice}</div>
                        
                        <div style={styles.quantityControl}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}><Minus size={14} /></button>
                          <span style={styles.qtyValue}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}><Plus size={14} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div style={styles.footer}>
                {buyXGetYDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-success)' }}>
                    <span>Buy X Get Y Discount</span>
                    <span>-₹{buyXGetYDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{total.toFixed(2)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>{amountForFreeShipping === 0 ? 'Free' : 'Calculated at checkout'}</span>
                </div>
                
                <button onClick={handleCheckout} className="btn btn-primary" style={styles.checkoutBtn}>
                  Checkout • ₹{total.toFixed(2)}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    background: 'white',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-lg)',
    borderBottom: '1px solid var(--color-border)',
  },
  closeBtn: {
    color: 'var(--color-text-muted)',
    transition: 'color var(--transition-fast)',
  },
  shippingBarContainer: {
    padding: 'var(--spacing-lg)',
    background: '#fcfcfc',
    borderBottom: '1px solid var(--color-border)',
  },
  shippingText: {
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: 'var(--spacing-sm)',
  },
  progressBarWrapper: {
    height: '6px',
    background: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '3px',
  },
  itemsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  emptyCart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--color-text-muted)',
  },
  cartItem: {
    display: 'flex',
    gap: 'var(--spacing-md)',
    paddingBottom: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-border)',
  },
  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: '0.95rem',
    margin: 0,
    fontWeight: 500,
  },
  removeBtn: {
    color: 'var(--color-text-muted)',
  },
  itemPrice: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    width: 'fit-content',
    marginTop: 'var(--spacing-sm)',
  },
  qtyBtn: {
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-muted)',
  },
  qtyValue: {
    padding: '0 8px',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  footer: {
    padding: 'var(--spacing-lg)',
    borderTop: '1px solid var(--color-border)',
    background: '#fafafa',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 'var(--spacing-sm)',
    fontSize: '0.9rem',
  },
  checkoutBtn: {
    width: '100%',
    padding: 'var(--spacing-md)',
    marginTop: 'var(--spacing-md)',
    fontSize: '1.05rem',
  }
};

export default CartDrawer;
