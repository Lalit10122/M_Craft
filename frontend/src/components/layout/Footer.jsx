import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const styles = {
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    colTitle: {
      color: 'white',
      marginBottom: '8px'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    link: {
      color: '#ccc',
      textDecoration: 'none'
    }
  };

  return (
    <footer style={{ background: '#1a1a1a', color: 'white', padding: 'var(--spacing-3xl) 0 var(--spacing-md) 0' }}>
      <div className="container responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xxl)' }}>
        
        {/* Brand & Newsletter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '2rem' }}>Aurelia</h2>
          <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Handcrafted luxury jewelry. Discover the story behind every piece.
          </p>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <h4 style={{ color: 'white', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Join the Inner Circle</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="email" placeholder="Your email address" style={{ padding: '10px 14px', flex: 1, borderRadius: '2px', border: '1px solid #333', background: '#222', color: 'white', outline: 'none' }} />
              <button className="btn btn-secondary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>Subscribe</button>
            </div>
          </div>
        </div>

        {/* Support Links */}
        <div style={styles.column}>
          <h4 style={styles.colTitle}>Client Services</h4>
          <ul style={styles.list}>
            <li><Link to="/faq" style={styles.link}>FAQ</Link></li>
            <li><Link to="/page/shipping-policy" style={styles.link}>Shipping & Delivery</Link></li>
            <li><Link to="/page/returns-exchanges" style={styles.link}>Returns & Exchanges</Link></li>
            <li><Link to="/page/contact-us" style={styles.link}>Contact Us</Link></li>
            <li><Link to="/profile" style={styles.link}>Order Tracking</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div style={styles.column}>
          <h4 style={styles.colTitle}>The Brand</h4>
          <ul style={styles.list}>
            <li><Link to="/about" style={styles.link}>Our Craft Story</Link></li>
            <li><Link to="/collections" style={styles.link}>Collections</Link></li>
            <li><Link to="/journal" style={styles.link}>Journal</Link></li>
            <li><Link to="/page/privacy-policy" style={styles.link}>Privacy Policy</Link></li>
            <li><Link to="/page/terms-of-service" style={styles.link}>Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container" style={{ borderTop: '1px solid #333', paddingTop: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#888', fontSize: '0.85rem' }}>
        <p>&copy; {new Date().getFullYear()} Aurelia Jewels. Handcrafted with intention.</p>
      </div>
    </footer>
  );
};

export default Footer;
