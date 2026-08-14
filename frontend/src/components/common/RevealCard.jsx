import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const RevealCard = ({ children, index = 0, className = '', style = {} }) => {
  const shouldReduceMotion = useReducedMotion();

  // Alternating direction: even indices drift from left, odd from right
  const isEven = index % 2 === 0;
  const xDrift = isEven ? -10 : 10;

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 20,
      x: shouldReduceMotion ? 0 : xDrift,
      scale: shouldReduceMotion ? 1 : 0.96,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(8px)'
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        duration: 0.6, 
        ease: [0.25, 1, 0.5, 1] 
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
