import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../utils/api';
import { 
  LayoutDashboard, Package, Grid, ShoppingBag, 
  RefreshCcw, Users, Tag, MessageSquare, 
  MapPin, AlertTriangle, Settings, X,
  DollarSign, Megaphone, Truck, Heart, Palette
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const [badges, setBadges] = useState({ lowStock: 0, pendingReturns: 0, pendingReviews: 0 });

  useEffect(() => {
    // Fetch stats for badges
    const fetchBadges = async () => {
      try {
        const res = await api.get('/admin/dashboard/stats');
        setBadges({
          lowStock: res.data.data.lowStockCount || 0,
          pendingReturns: res.data.data.pendingReturns || 0,
          pendingReviews: res.data.data.pendingReviews || 0
        });
      } catch (err) {
        console.error('Failed to fetch sidebar stats');
      }
    };
    fetchBadges();
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Financials', path: '/admin/analytics/financial', icon: <DollarSign size={18} /> },
    { name: 'Marketing', path: '/admin/analytics/marketing', icon: <Megaphone size={18} /> },
    { name: 'Supply Chain', path: '/admin/analytics/supply-chain', icon: <Truck size={18} /> },
    { name: 'CRM Insights', path: '/admin/analytics/crm', icon: <Heart size={18} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={18} />, badge: badges.lowStock, badgeColor: 'error' },
    { name: 'Collections', path: '/admin/collections', icon: <Grid size={18} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={18} /> },
    { name: 'Returns', path: '/admin/returns', icon: <RefreshCcw size={18} />, badge: badges.pendingReturns, badgeColor: 'warning' },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={18} /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={18} /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare size={18} />, badge: badges.pendingReviews, badgeColor: 'warning' },
    { name: 'Pincodes', path: '/admin/pincodes', icon: <MapPin size={18} /> },
    { name: 'Low Stock', path: '/admin/low-stock', icon: <AlertTriangle size={18} /> },
    { name: 'Appearance', path: '/admin/appearance', icon: <Palette size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? 'mobile-open' : ''}`}>
      <div className={styles.logo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Aurelia Admin</h2>
        <button 
          className="show-mobile-flex btn btn-outline" 
          style={{ display: 'none', border: 'none', padding: '4px' }}
          onClick={() => setIsOpen(false)}
        >
          <X size={20} />
        </button>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            end={item.path === '/admin'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <div className={styles.navItemContent}>
              {item.icon}
              <span>{item.name}</span>
            </div>
            {item.badge > 0 && (
              <span className={`${styles.badge} ${styles[item.badgeColor]}`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
