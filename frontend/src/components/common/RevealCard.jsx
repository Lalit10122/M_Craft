import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const RevealCard = ({ children, index = 0, className = '', style = {} }) => {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 20
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, /* Slower and gentler */
        ease: [0.33, 1, 0.68, 1] 
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className={className}
      style={{ ...style, willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  );
};

export default RevealCard;
