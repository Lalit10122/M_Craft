import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, LogOut, Settings, Menu } from 'lucide-react';
import styles from './AdminHeader.module.css';

const AdminHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    }
  };

  return (
    <header className={styles.header}>
      <button 
        className="show-mobile-flex btn btn-outline" 
        style={{ display: 'none', border: 'none', padding: '8px' }}
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </button>
      <div className={styles.spacer}></div>
      <div className={styles.userSection}>
        <div className={styles.avatar}>
          <User size={20} />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Admin User</span>
          <span className={styles.role}>Super Admin</span>
        </div>
        <div className={styles.dropdown}>
          <button onClick={() => navigate('/admin/settings')} className={styles.dropdownBtn}>
            <Settings size={16} /> Settings
          </button>
          <button onClick={handleLogout} className={styles.dropdownBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
