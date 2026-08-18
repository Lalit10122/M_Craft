import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PromoBanner = () => {
  const [promotions, setPromotions] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await api.get('/promotions/active');
        if (response.data?.data) {
          setPromotions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [promotions]);

  if (!visible || promotions.length === 0) return null;

  const currentPromo = promotions[currentPromoIndex];

  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--color-primary), #333)',
      color: 'white',
      minHeight: '40px',
      padding: '12px 30px 12px 15px',
      position: 'relative',
      textAlign: 'center',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px'
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPromoIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%', fontSize: '0.9rem' }}
          onClick={() => {
            if (currentPromo.scope === 'SPECIFIC_PRODUCTS' || currentPromo.scope === 'CATEGORY' || currentPromo.scope === 'COLLECTION') {
              navigate(`/campaign/${currentPromo.id}`);
            } else {
              navigate('/shop');
            }
          }}
        >
          <span style={{ fontWeight: 'bold' }}>{currentPromo.name}</span>
          <span>
            {currentPromo.type === 'PERCENTAGE_OFF' && `${currentPromo.value}% OFF`}
            {currentPromo.type === 'FLAT_OFF' && `₹${currentPromo.value} OFF`}
            {currentPromo.type === 'BUY_X_GET_Y' && `Buy ${currentPromo.buyQty} Get ${currentPromo.getQty} Free!`}
          </span>
          <button 
            className="btn btn-outline" 
            style={{ padding: '2px 10px', fontSize: '0.8rem', borderColor: 'white', color: 'white', marginTop: '4px' }}
          >
            Shop Now
          </button>
        </motion.div>
      </AnimatePresence>
      <button 
        onClick={(e) => { e.stopPropagation(); setVisible(false); }}
        style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default PromoBanner;
