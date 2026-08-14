import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingBag, MapPin, LogOut, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerLayout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'My Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Order History', path: '/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Addresses', path: '/addresses', icon: <MapPin size={20} /> },
  ];

  if (!isAuthenticated || !user) return null;

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl) 20px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      
      {/* Mobile Toggle */}
      <div className="show-mobile-flex" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>My Account</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-xxl)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <aside className={`customer-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{ flex: '0 0 250px', background: 'white', borderRadius: '12px', padding: 'var(--spacing-lg)', border: '1px solid #eaeaea' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)', borderBottom: '1px solid #eaeaea' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.5rem', fontWeight: 600 }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.name}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>{user.email}</p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--color-primary)' : '#555',
                  background: isActive ? '#f8f9fa' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease'
                })}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
            
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#dc2626',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                marginTop: '16px',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >
              <LogOut size={20} />
              Log Out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div style={{ flex: '1 1 0%', minWidth: 300 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .customer-sidebar {
            display: none;
            width: 100%;
            flex: 1 1 100% !important;
          }
          .customer-sidebar.open {
            display: block;
          }
        }
      `}} />
    </div>
  );
};

export default CustomerLayout;
