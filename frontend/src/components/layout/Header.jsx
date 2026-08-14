import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, X, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import PromoBanner from '../product/PromoBanner';
import api from '../../utils/api';
import styles from './Header.module.css';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null); // Mega Menu state
  const [categories, setCategories] = useState([]);
  
  // Mobile specific state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const navigate = useNavigate();
  const toggleCart = useCartStore(state => state.toggleCart);
  const cartCount = useCartStore(state => state.getCartCount());
  
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/suggest?q=${debouncedSearchQuery}`);
        setSuggestions(res.data.data);
      } catch (err) {
        console.error('Search failed', err);
      }
    };
    if (debouncedSearchQuery.trim()) {
      fetchResults();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleMobileSection = (section) => {
    setExpandedMobileSection(expandedMobileSection === section ? null : section);
  };

  return (
    <>
      <PromoBanner />
      
      {/* Announcement Marquee */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          <span>FREE SUNGLASSES WORTH 949 ABOVE A PURCHASE OF RS 2000 ✦ FREE SHIPPING ON ALL PREPAID ORDERS ✦ NEW DOPAMINE DRIP COLLECTION OUT NOW</span>
          <span>FREE SUNGLASSES WORTH 949 ABOVE A PURCHASE OF RS 2000 ✦ FREE SHIPPING ON ALL PREPAID ORDERS ✦ NEW DOPAMINE DRIP COLLECTION OUT NOW</span>
        </div>
      </div>

      <header className={styles.header}>
        <div className={`container ${styles.headerContainer}`}>
          
          {/* Mobile Hamburger (Left) */}
          <button 
            className={`show-mobile-flex ${styles.iconBtn}`} 
            style={{ display: 'none' }} // overridden by show-mobile-flex which has !important in CSS
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo (Centered on mobile, Left on desktop) */}
          <div className={styles.logo} style={{ flex: 1, textAlign: 'center' }}>
            <Link to="/" style={{ display: 'inline-block' }}>
              <h2>Aurelia</h2>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className={`${styles.nav} hide-tablet-down`}>
            <div 
              className={styles.navItem} 
              onMouseEnter={() => setActiveMenu('shop')} 
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link to="/shop">Shop</Link>
              <AnimatePresence>
                {activeMenu === 'shop' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className={styles.megaMenu}
                  >
                    <div style={{ display: 'flex', gap: '3rem' }}>
                      {categories.filter(c => !c.parentId).map(parent => (
                        <div key={parent.id}>
                          <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                            {parent.name}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {categories.filter(c => c.parentId === parent.id).map(child => (
                              <Link key={child.id} to={`/shop?category=${child.slug}`} style={{ color: 'var(--color-text)' }}>
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div>
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                          Trending Collections
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <Link to="/collections" style={{ color: 'var(--color-text)' }}>Office Siren</Link>
                          <Link to="/collections" style={{ color: 'var(--color-text)' }}>Dopamine Drip</Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/collections">Collections</Link>
            <Link to="/about">About Us</Link>
          </nav>

          {/* Actions (Right) */}
          <div className={styles.actions} style={{ flex: 1, justifyContent: 'flex-end' }}>
            
            {/* Desktop Expanding Search Bar */}
            <div className={`${styles.searchWrapper} hide-mobile`}>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 250, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={styles.searchForm}
                    onSubmit={handleSearchSubmit}
                  >
                    <input
                      type="text"
                      placeholder="Search jewelry..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className={styles.searchInput}
                    />
                    {suggestions.length > 0 && (
                      <div className={styles.suggestionsDropdown}>
                        {suggestions.map((item) => (
                          <Link 
                            key={item.slug} 
                            to={`/product/${item.slug}`}
                            className={styles.suggestionItem}
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <img src={item.firstImage} alt={item.name} width={40} height={40} />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                        <button type="submit" className={styles.viewAllBtn}>
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
              
              <button 
                className={styles.iconBtn} 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
              >
                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
            </div>

            {isAuthenticated ? (
              <div className={`${styles.iconBtn} hide-mobile`} style={{ position: 'relative' }} onMouseEnter={() => setActiveMenu('user')} onMouseLeave={() => setActiveMenu(null)}>
                <User size={20} />
                <AnimatePresence>
                  {activeMenu === 'user' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      style={{ position: 'absolute', top: '100%', right: 0, background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '200px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100 }}
                    >
                      <span style={{ fontSize: '0.9rem', color: '#888', marginBottom: '8px' }}>Hi, {user?.name?.split(' ')[0]}</span>
                      <Link to="/profile" style={{ textDecoration: 'none', color: '#111', fontSize: '0.95rem' }}>My Account</Link>
                      <button onClick={logout} style={{ textDecoration: 'none', color: '#dc2626', fontSize: '0.95rem', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', marginTop: '8px' }}>Log Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className={`${styles.iconBtn} hide-mobile`}><User size={20} /></Link>
            )}

            <button className={styles.iconBtn} style={{ position: 'relative' }} onClick={toggleCart}>
              <ShoppingCart size={20} />
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className={styles.cartBadge}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Slide-in */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className={styles.mobileMenuOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              className={styles.mobileMenu}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className={styles.mobileMenuHeader}>
                <h2>Aurelia</h2>
                <button className={styles.iconBtn} onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search jewelry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '40px', borderRadius: '24px' }}
                  />
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                </div>
              </form>

              <nav className={styles.mobileNav}>
                <div>
                  <div 
                    className={styles.mobileNavLink} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => toggleMobileSection('shop')}
                  >
                    <span>Shop</span>
                    {expandedMobileSection === 'shop' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <AnimatePresence>
                    {expandedMobileSection === 'shop' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className={styles.mobileSubLinks}>
                          <Link to="/shop?q=necklaces" onClick={() => setIsMobileMenuOpen(false)}>Necklaces</Link>
                          <Link to="/shop?q=earrings" onClick={() => setIsMobileMenuOpen(false)}>Earrings</Link>
                          <Link to="/shop?q=rings" onClick={() => setIsMobileMenuOpen(false)}>Rings</Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <Link to="/collections" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
                <Link to="/about" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              </nav>

              <div className={styles.mobileActions}>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className={styles.mobileActionLink} onClick={() => setIsMobileMenuOpen(false)}>
                      <User size={24} /> My Account
                    </Link>
                    <button className={styles.mobileActionLink} style={{ color: '#dc2626', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className={styles.mobileActionLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <User size={24} /> Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
