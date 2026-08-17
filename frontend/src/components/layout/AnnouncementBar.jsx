import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANNOUNCEMENTS = [
  "Free shipping on all orders over ₹999",
  "The New Fall Collection has arrived",
  "Handcrafted with love. 100% Secure Checkout."
];

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#111', color: 'white', padding: '8px 20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        >
          {ANNOUNCEMENTS[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementBar;
