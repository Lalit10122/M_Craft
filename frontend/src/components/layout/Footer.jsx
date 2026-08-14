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
    <footer style={{ background: 'var(--color-primary)', color: 'white', padding: 'var(--spacing-xxl) 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: 'white', marginBottom: 'var(--spacing-md)' }}>Aurelia</h2>
          <p style={{ color: '#ccc', maxWidth: '300px' }}>
            Handcrafted luxury jewelry for everyday elegance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-xxl)' }}>
            <div style={styles.column}>
              <h4 style={styles.colTitle}>Support</h4>
              <ul style={styles.list}>
                <li><Link to="/faq" style={styles.link}>FAQ</Link></li>
                <li><Link to="/page/shipping-policy" style={styles.link}>Shipping Policy</Link></li>
                <li><Link to="/page/returns-exchanges" style={styles.link}>Returns & Exchanges</Link></li>
                <li><Link to="/page/contact-us" style={styles.link}>Contact Us</Link></li>
              </ul>
            </div>

            <div style={styles.column}>
              <h4 style={styles.colTitle}>Company</h4>
              <ul style={styles.list}>
                <li><Link to="/page/about-us" style={styles.link}>About Us</Link></li>
                <li><Link to="/page/privacy-policy" style={styles.link}>Privacy Policy</Link></li>
                <li><Link to="/page/terms-of-service" style={styles.link}>Terms of Service</Link></li>
              </ul>
            </div>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid #333', marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-md)', textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} Aurelia Jewels. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
