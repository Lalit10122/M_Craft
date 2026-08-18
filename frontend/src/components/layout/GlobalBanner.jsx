import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const GlobalBanner = ({ isMobileDrawer = false }) => {
  const [config, setConfig] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/settings/public');
        if (response.data?.data?.global_banner_config) {
          setConfig(response.data.data.global_banner_config);
        }
      } catch (error) {
        console.error('Failed to fetch banner config:', error);
      }
    };
    fetchConfig();
  }, []);

  if (!config || !config.isActive) return null;

  // If we are in the mobile drawer but the config says don't show on mobile, return null
  if (isMobileDrawer && !config.showOnMobile) return null;

  // If we are NOT in the mobile drawer (meaning we are on desktop top) and config says don't show on desktop, return null
  if (!isMobileDrawer && !config.showOnDesktop) return null;

  return (
    <div 
      className={!isMobileDrawer ? 'hide-mobile' : ''} 
      style={{
        background: 'linear-gradient(90deg, var(--color-primary), #333)',
        color: 'white',
        minHeight: '40px',
        padding: '12px 20px',
        position: 'relative',
        textAlign: 'center',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: isMobileDrawer ? '8px' : '0px',
        marginBottom: isMobileDrawer ? 'var(--spacing-lg)' : '0'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            cursor: config.link ? 'pointer' : 'default', 
            display: 'flex', 
            flexDirection: isMobileDrawer ? 'column' : 'row', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '12px', 
            width: '100%', 
            fontSize: '0.9rem' 
          }}
          onClick={() => {
            if (config.link) {
              navigate(config.link);
            }
          }}
        >
          <span style={{ fontWeight: '600' }}>{config.text}</span>
          
          {config.link && (
            <button 
              className="btn btn-outline" 
              style={{ 
                padding: '4px 12px', 
                fontSize: '0.8rem', 
                borderColor: 'white', 
                color: 'white',
                background: 'transparent'
              }}
            >
              Explore
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GlobalBanner;
